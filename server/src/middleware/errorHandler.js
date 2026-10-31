import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export function notFound(req, res, next) {
  next(new ApiError(404, 'NOT_FOUND', `Không tìm thấy ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status ?? 500;
  let code = typeof err.code === 'string' ? err.code : 'INTERNAL_ERROR';
  let message = err.message || 'Lỗi máy chủ';
  let details;

  if (err instanceof ZodError) {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Dữ liệu không hợp lệ';
    details = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
  } else if (err.code === 11000) {
    status = 409;
    code = 'DUPLICATE_KEY';
    const fields = Object.keys(err.keyPattern || {});
    message = fields.length
      ? `Dữ liệu đã tồn tại (${fields.join(', ')})`
      : 'Dữ liệu đã tồn tại';
  } else if (err.name === 'CastError') {
    status = 400;
    code = 'INVALID_ID';
    message = 'ID không hợp lệ';
  } else if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Dữ liệu không hợp lệ';
    details = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
  }

  if (status >= 500) {
    logger.error({ err, url: req.originalUrl, method: req.method }, 'Unhandled error');
  }

  res.status(status).json({
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}
