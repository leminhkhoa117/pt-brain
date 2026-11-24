import { verifyAccessToken, ACCESS_COOKIE } from '../services/tokens.js';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Xác thực access token + kiểm tra phiên còn sống.
 *
 * Kiểm tra session mỗi request đổi lấy một indexed lookup, nhưng giúp logout/
 * đổi mật khẩu thu hồi access token ngay thay vì chờ hết TTL 15 phút. Đây là
 * đánh đổi có chủ đích cho ứng dụng có dữ liệu sức khỏe nhạy cảm.
 */
export async function requireAuth(req, res, next) {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  const token = req.cookies?.[ACCESS_COOKIE] || bearer;
  if (!token) return next(ApiError.unauthorized());

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return next(ApiError.unauthorized('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại'));
  }

  try {
    if (payload.sid) {
      const session = await Session.findOne({ _id: payload.sid, userId: payload.sub })
        .select('expiresAt authVersion')
        .lean();
      if (!session || session.expiresAt <= new Date()) {
        return next(ApiError.unauthorized('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại'));
      }
      if (Number(payload.ver || 0) !== Number(session.authVersion || 0)) {
        return next(ApiError.unauthorized('Phiên đăng nhập đã thay đổi, vui lòng đăng nhập lại'));
      }
      req.sessionId = payload.sid;
    } else {
      // Access token kiểu cũ (không có sid): vẫn kiểm tra user tồn tại và mật
      // khẩu chưa bị đổi sau thời điểm token được phát hành.
      const user = await User.findById(payload.sub).select('passwordChangedAt').lean();
      if (!user) return next(ApiError.unauthorized('Tài khoản không tồn tại'));
      if (
        user.passwordChangedAt &&
        payload.iat &&
        payload.iat * 1000 < new Date(user.passwordChangedAt).getTime()
      ) {
        return next(ApiError.unauthorized('Mật khẩu đã thay đổi, vui lòng đăng nhập lại'));
      }
      req.sessionId = null;
    }

    req.userId = payload.sub;
    return next();
  } catch (error) {
    return next(error);
  }
}
