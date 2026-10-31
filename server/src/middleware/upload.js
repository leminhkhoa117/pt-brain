import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const storage = multer.memoryStorage();

export const uploadPdf = multer({
  storage,
  limits: {
    fileSize: env.PDF_MAX_MB * 1024 * 1024,
    files: 1,
  },
  fileFilter(req, file, cb) {
    const isPdf = /pdf/i.test(file.mimetype) || /\.pdf$/i.test(file.originalname);
    if (!isPdf) return cb(new ApiError(400, 'INVALID_FILE', 'Chỉ nhận file PDF'));
    return cb(null, true);
  },
});

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 1,
  },
  fileFilter(req, file, cb) {
    const ok = /^image\/(jpeg|png|webp)$/i.test(file.mimetype);
    if (!ok) return cb(new ApiError(400, 'INVALID_IMAGE', 'Chỉ nhận ảnh JPEG, PNG hoặc WebP'));
    return cb(null, true);
  },
});

export const uploadImages = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 4,
  },
  fileFilter(req, file, cb) {
    const ok = /^image\/(jpeg|png|webp)$/i.test(file.mimetype);
    if (!ok) return cb(new ApiError(400, 'INVALID_IMAGE', 'Chỉ nhận ảnh JPEG, PNG hoặc WebP'));
    return cb(null, true);
  },
});
