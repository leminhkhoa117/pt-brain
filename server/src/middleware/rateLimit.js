import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

const json = (message) => ({ error: { code: 'RATE_LIMITED', message } });
const skip = () => env.NODE_ENV === 'test';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: json('Quá nhiều yêu cầu, vui lòng thử lại sau ít phút.'),
  skip,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: json('Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút.'),
  skip,
});

/**
 * Giới hạn theo cặp IP + email để kẻ tấn công không thể thử một danh sách mật
 * khẩu cho một tài khoản từ nhiều request liên tiếp. Email được hash để không
 * lưu PII trực tiếp trong store rate-limit.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = String(req.body?.email || '').trim().toLowerCase().slice(0, 200);
    const digest = crypto.createHash('sha256').update(email).digest('hex').slice(0, 16);
    return `${req.ip}:${digest}`;
  },
  message: json('Quá nhiều lần đăng nhập sai cho tài khoản này. Vui lòng thử lại sau 15 phút.'),
  skip,
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: json('Bạn yêu cầu đặt lại mật khẩu quá nhiều lần. Vui lòng thử lại sau 15 phút.'),
  skip,
});

export const calcLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: json('Quá nhiều lần tính toán, vui lòng thử lại sau.'),
  skip,
});

// Dùng cho các endpoint gọi AI (Giai đoạn 2+)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: json('Bạn gọi AI quá nhanh, vui lòng chờ một chút.'),
  skip,
});
