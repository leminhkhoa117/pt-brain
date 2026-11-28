import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function allowedOrigins() {
  return env.CLIENT_ORIGIN.split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

/**
 * Lớp phòng thủ CSRF bổ sung cho cookie SameSite=Lax.
 *
 * Trình duyệt hiện đại luôn gửi Origin cho POST/PATCH/DELETE khác origin; nếu
 * Origin không nằm trong danh sách cho phép thì chặn. Request server-to-server
 * không có Origin (curl, test) vẫn đi qua — nhưng chúng không mang cookie của
 * nạn nhân nên không phải vector CSRF.
 */
export function csrfGuard(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get('origin');
  if (origin) {
    const normalized = origin.replace(/\/$/, '');
    if (!allowedOrigins().includes(normalized)) {
      return next(new ApiError(403, 'CSRF_BLOCKED', 'Nguồn yêu cầu không hợp lệ'));
    }
    return next();
  }

  // Một số trình duyệt cũ không gửi Origin; Sec-Fetch-Site là tín hiệu thay thế.
  const site = req.get('sec-fetch-site');
  if (site === 'cross-site') {
    return next(new ApiError(403, 'CSRF_BLOCKED', 'Nguồn yêu cầu không hợp lệ'));
  }

  // Yêu cầu header tùy chỉnh để chặn form HTML cross-site ngay cả khi Origin bị
  // thiếu. Client axios luôn gửi header này; test/supertest được bỏ qua.
  if (req.get('x-requested-with') === 'XMLHttpRequest') return next();
  if (env.NODE_ENV === 'test') return next();

  return next(new ApiError(403, 'CSRF_BLOCKED', 'Thiếu header xác thực yêu cầu'));
}
