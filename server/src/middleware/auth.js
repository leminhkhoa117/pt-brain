import { verifyAccessToken, ACCESS_COOKIE } from '../services/tokens.js';
import { ApiError } from '../utils/ApiError.js';

export function requireAuth(req, res, next) {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  const token = req.cookies?.[ACCESS_COOKIE] || bearer;
  if (!token) return next(ApiError.unauthorized());
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    return next();
  } catch {
    return next(ApiError.unauthorized('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại'));
  }
}
