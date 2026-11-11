import mongoose from 'mongoose';
import { env } from '../config/env.js';

/**
 * Lưu file người dùng (ảnh, PDF) trong MongoDB GridFS khi chạy production
 * không có ổ đĩa persistent. Nhờ vậy Render free vẫn giữ được ảnh sau restart.
 *
 * Mỗi file được đặt trong namespace riêng (kind) để tránh trùng tên:
 *   <kind>/<filename>
 */
const BUCKET_NAME = 'uploads';

export function isMongoStorage() {
  return env.STORAGE_DRIVER === 'mongo';
}

function bucket() {
  const db = mongoose.connection.db;
  if (!db) throw new Error('MongoDB chưa kết nối, không thể dùng GridFS');
  return new mongoose.mongo.GridFSBucket(db, { bucketName: BUCKET_NAME });
}

function keyFor(kind, filename) {
  return `${kind}/${filename}`;
}

export async function findStoredFile(kind, filename) {
  const docs = await bucket()
    .find({ filename: keyFor(kind, filename) })
    .sort({ uploadDate: -1 })
    .limit(1)
    .toArray();
  return docs[0] || null;
}

export async function storedFileExists(kind, filename) {
  return Boolean(await findStoredFile(kind, filename));
}

export async function saveStoredFile({ kind, filename, buffer, contentType }) {
  await removeStoredFile(kind, filename);

  return new Promise((resolve, reject) => {
    const upload = bucket().openUploadStream(keyFor(kind, filename), {
      contentType,
      metadata: { kind, filename, uploadedAt: new Date() },
    });
    upload.on('error', reject);
    upload.on('finish', () => resolve(filename));
    upload.end(buffer);
  });
}

export async function removeStoredFile(kind, filename) {
  const doc = await findStoredFile(kind, filename);
  if (!doc) return;
  await bucket()
    .delete(doc._id)
    .catch(() => {});
}

function parseRange(header, total) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(String(header || '').trim());
  if (!match) return null;

  let start;
  let end;
  if (match[1] === '' && match[2] !== '') {
    // bytes=-500 => 500 byte cuối
    const suffix = Number(match[2]);
    start = Math.max(0, total - suffix);
    end = total - 1;
  } else {
    start = match[1] === '' ? 0 : Number(match[1]);
    end = match[2] === '' ? total - 1 : Number(match[2]);
  }

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (start < 0 || end < start || start >= total) return { invalid: true };
  return { start, end: Math.min(end, total - 1) };
}

/**
 * Gửi file từ GridFS. Trả về false nếu không tìm thấy để controller tự báo 404.
 * Hỗ trợ Range để trình xem PDF trong iframe tua được trang.
 */
export async function sendStoredFile(
  req,
  res,
  { kind, filename, contentType, cacheControl, disposition },
) {
  const doc = await findStoredFile(kind, filename);
  if (!doc) return false;

  const total = doc.length;
  const range = parseRange(req.headers.range, total);
  if (range?.invalid) {
    res.status(416).setHeader('Content-Range', `bytes */${total}`);
    res.end();
    return true;
  }

  const start = range?.start ?? 0;
  const end = range?.end ?? total - 1;

  if (contentType) res.setHeader('Content-Type', contentType);
  else if (doc.contentType) res.setHeader('Content-Type', doc.contentType);
  res.setHeader('Accept-Ranges', 'bytes');
  if (cacheControl) res.setHeader('Cache-Control', cacheControl);
  if (disposition) res.setHeader('Content-Disposition', disposition);
  res.setHeader('Content-Length', end - start + 1);

  if (range) {
    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${total}`);
  }

  if (req.method === 'HEAD') {
    res.end();
    return true;
  }

  // GridFS dùng `end` exclusive, còn Range của HTTP là inclusive.
  const stream = range
    ? bucket().openDownloadStream(doc._id, { start, end: end + 1 })
    : bucket().openDownloadStream(doc._id);
  stream.on('error', () => {
    if (res.headersSent) res.destroy();
    else res.status(500).end();
  });
  stream.pipe(res);
  return true;
}
