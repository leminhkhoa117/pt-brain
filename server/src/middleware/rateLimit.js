import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const json = (message) => ({ error: { code: 'RATE_LIMITED', message } });

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: json('Quá nhiều yêu cầu, vui lòng thử lại sau ít phút.'),
  skip: () => env.NODE_ENV === 'test',
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: json('Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút.'),
  skip: () => env.NODE_ENV === 'test',
});

export const calcLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: json('Quá nhiều lần tính toán, vui lòng thử lại sau.'),
  skip: () => env.NODE_ENV === 'test',
});

// Dùng cho các endpoint gọi AI (Giai đoạn 2+)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: json('Bạn gọi AI quá nhanh, vui lòng chờ một chút.'),
  skip: () => env.NODE_ENV === 'test',
});
