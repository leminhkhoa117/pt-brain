import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

export const ACCESS_COOKIE = 'pt_access';
export const REFRESH_COOKIE = 'pt_refresh';
export const OAUTH_COOKIE = 'pt_oauth';

export function signAccessToken(userId, sessionId, authVersion = 0) {
  return jwt.sign(
    {
      sub: String(userId),
      type: 'access',
      ...(sessionId ? { sid: String(sessionId), ver: Number(authVersion) || 0 } : {}),
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TOKEN_TTL },
  );
}

export function signRefreshToken(userId, sessionId) {
  return jwt.sign(
    {
      sub: String(userId),
      type: 'refresh',
      ...(sessionId ? { sid: String(sessionId) } : {}),
      jti: crypto.randomUUID(),
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d` },
  );
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
  if (payload.type !== 'access') throw new Error('Sai loại token');
  return payload;
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
  if (payload.type !== 'refresh') throw new Error('Sai loại token');
  return payload;
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Production luôn bật Secure, kể cả khi quên đặt COOKIE_SECURE: cookie auth
// không được phép đi qua HTTP thường.
const secureCookie = env.NODE_ENV === 'production' ? true : env.COOKIE_SECURE;

const baseCookie = {
  httpOnly: true,
  sameSite: 'lax',
  secure: secureCookie,
  path: '/',
};

/** Đổi '15m' / '1h' / '7d' sang mili giây để đồng bộ maxAge cookie với JWT. */
function accessTokenMaxAgeMs() {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(env.ACCESS_TOKEN_TTL);
  if (!match) return 15 * 60 * 1000;
  const unitMs = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2]];
  return Number(match[1]) * unitMs;
}

/**
 * remember=true: cookie tồn tại 30 ngày, đóng trình duyệt vẫn đăng nhập.
 * remember=false: cookie phiên (không maxAge), mất khi đóng trình duyệt.
 */
export function setAuthCookies(res, { accessToken, refreshToken, remember = true }) {
  const accessOptions = { ...baseCookie };
  const refreshOptions = { ...baseCookie };
  if (remember) {
    accessOptions.maxAge = accessTokenMaxAgeMs();
    refreshOptions.maxAge = env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
  }
  res.cookie(ACCESS_COOKIE, accessToken, accessOptions);
  res.cookie(REFRESH_COOKIE, refreshToken, refreshOptions);
}

export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, baseCookie);
  res.clearCookie(REFRESH_COOKIE, baseCookie);
}

/** Cookie tạm giữ state + PKCE verifier của luồng Google OAuth. */
export function setOAuthCookie(res, payload) {
  const value = Buffer.from(JSON.stringify(payload)).toString('base64url');
  res.cookie(OAUTH_COOKIE, value, {
    ...baseCookie,
    maxAge: 10 * 60 * 1000,
  });
}

export function readOAuthCookie(req) {
  const raw = req.cookies?.[OAUTH_COOKIE];
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (!parsed?.state || !parsed?.verifier) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearOAuthCookie(res) {
  res.clearCookie(OAUTH_COOKIE, baseCookie);
}

/** Origin đầu tiên trong CLIENT_ORIGIN, dùng cho redirect OAuth/email. */
export function primaryClientOrigin() {
  return env.CLIENT_ORIGIN.split(',')[0].trim().replace(/\/$/, '');
}

export function publicAppUrl() {
  return (env.APP_PUBLIC_URL || primaryClientOrigin()).replace(/\/$/, '');
}
