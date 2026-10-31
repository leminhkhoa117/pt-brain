import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { BodyLog } from '../models/BodyLog.js';
import { buildBodyLogPdf } from '../services/pdf/summaryPdf.js';
import {
  exportCsv,
  getBodyLog,
  getSummary as getMetricsSummary,
  listBodyLogs,
  POSTURE_CHECKLIST,
  upsertBodyLog,
} from '../services/metricsService.js';
import { getUser } from '../services/authService.js';
import { ApiError } from '../utils/ApiError.js';
import { parseDateKey } from '../utils/date.js';

const PHOTO_DIR = fileURLToPath(new URL('../../uploads/photos/', import.meta.url));

function detectImageExt(buffer) {
  if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg';
  }
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

export async function listMetrics(req, res) {
  const logs = await listBodyLogs(req.userId, req.validatedQuery || {});
  res.json({ data: { logs } });
}

export async function getMetric(req, res) {
  const log = await getBodyLog(req.userId, req.params.date);
  res.json({ data: { log } });
}

export async function putMetric(req, res) {
  const user = await getUser(req.userId);
  const log = await upsertBodyLog(user, req.params.date, req.body);
  res.json({ data: { log, checklist: POSTURE_CHECKLIST } });
}

export async function summary(req, res) {
  const data = await getMetricsSummary(req.userId, req.validatedQuery || {});
  res.json({ data: { ...data, checklist: POSTURE_CHECKLIST } });
}

export async function downloadCsv(req, res) {
  const csv = await exportCsv(req.userId);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="pt-brain-bodylog.csv"');
  // BOM để Excel mở đúng tiếng Việt
  res.send(`\ufeff${csv}`);
}

export async function downloadPdf(req, res) {
  const [user, logs] = await Promise.all([
    getUser(req.userId),
    listBodyLogs(req.userId, {}),
  ]);
  const pdf = await buildBodyLogPdf(logs, user);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="pt-brain-bodylog.pdf"');
  res.send(pdf);
}

export async function uploadPhoto(req, res) {
  parseDateKey(req.params.date);
  if (!req.file?.buffer?.length) throw ApiError.badRequest('Chưa chọn ảnh');

  const ext = detectImageExt(req.file.buffer);
  if (!ext) throw ApiError.badRequest('File không phải ảnh JPEG/PNG/WebP hợp lệ');

  const log = await BodyLog.findOne({ userId: req.userId, dateKey: req.params.date });
  if (!log) {
    throw ApiError.notFound('Hãy lưu cân nặng của ngày này trước khi thêm ảnh tiến độ');
  }

  await fs.mkdir(PHOTO_DIR, { recursive: true });
  const filename = `${req.userId}-${req.params.date}-${crypto.randomUUID()}.${ext}`;
  await fs.writeFile(path.join(PHOTO_DIR, filename), req.file.buffer);

  log.photos.push({
    filename,
    note: typeof req.body?.note === 'string' ? req.body.note.slice(0, 300) : '',
    uploadedAt: new Date(),
  });
  await log.save();

  res.status(201).json({ data: { log, photo: log.photos.at(-1) } });
}

export async function servePhoto(req, res) {
  const filename = String(req.params.filename || '');
  if (!/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/i.test(filename)) {
    throw ApiError.badRequest('Tên file ảnh không hợp lệ');
  }
  const exists = await BodyLog.exists({ userId: req.userId, 'photos.filename': filename });
  if (!exists) throw ApiError.notFound('Không tìm thấy ảnh');
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.sendFile(path.join(PHOTO_DIR, filename));
}

export async function deletePhoto(req, res) {
  const filename = String(req.params.filename || '');
  const log = await BodyLog.findOne({ userId: req.userId, dateKey: req.params.date });
  if (!log) throw ApiError.notFound('Không tìm thấy bản ghi ngày này');

  const index = log.photos.findIndex((photo) => photo.filename === filename);
  if (index === -1) throw ApiError.notFound('Không tìm thấy ảnh');

  log.photos.splice(index, 1);
  await log.save();
  await fs.unlink(path.join(PHOTO_DIR, filename)).catch(() => {});
  res.json({ data: { ok: true } });
}
