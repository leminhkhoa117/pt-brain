import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { ApiError } from './ApiError.js';
import {
  isMongoStorage,
  removeStoredFile,
  saveStoredFile,
  sendStoredFile,
} from '../services/fileStore.js';

export const MIME_BY_EXT = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

export function mimeForFilename(filename) {
  const ext = String(filename).split('.').pop()?.toLowerCase();
  return MIME_BY_EXT[ext] || 'application/octet-stream';
}

export function detectImageExt(buffer) {
  if (!buffer?.length) return null;
  if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (
    buffer.length > 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return 'png';
  }
  if (
    buffer.length > 12 &&
    buffer.subarray(0, 4).toString() === 'RIFF' &&
    buffer.subarray(8, 12).toString() === 'WEBP'
  ) {
    return 'webp';
  }
  return null;
}

export async function saveImageFile(buffer, dir, prefix) {
  const ext = detectImageExt(buffer);
  if (!ext) throw new Error('Ảnh không hợp lệ');
  const filename = `${prefix}-${crypto.randomUUID()}.${ext}`;

  if (isMongoStorage()) {
    await saveStoredFile({
      kind: 'images',
      filename,
      buffer,
      contentType: MIME_BY_EXT[ext],
    });
  } else {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), buffer);
  }
  return filename;
}

export async function removeImageFile(dir, filename) {
  if (!filename) return;
  if (isMongoStorage()) {
    await removeStoredFile('images', filename);
    return;
  }
  await fs.unlink(path.join(dir, filename)).catch(() => {});
}

export async function sendImageFile(req, res, dir, filename, options = {}) {
  const cacheControl = options.cacheControl || 'private, max-age=3600';

  if (isMongoStorage()) {
    const found = await sendStoredFile(req, res, {
      kind: 'images',
      filename,
      contentType: mimeForFilename(filename),
      cacheControl,
    });
    if (!found) throw ApiError.notFound('Không tìm thấy ảnh');
    return;
  }

  res.setHeader('Cache-Control', cacheControl);
  await new Promise((resolve, reject) => {
    res.sendFile(path.join(dir, filename), (error) => {
      if (!error) return resolve();
      if (error.code === 'ENOENT') return reject(ApiError.notFound('Không tìm thấy ảnh'));
      return reject(error);
    });
  });
}
