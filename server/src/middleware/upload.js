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
