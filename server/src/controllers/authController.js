import * as authService from '../services/authService.js';
import {
  clearAuthCookies,
  clearOAuthCookie,
  primaryClientOrigin,
  readOAuthCookie,
  REFRESH_COOKIE,
  setAuthCookies,
  setOAuthCookie,
} from '../services/tokens.js';
import {
  createGoogleAuthRequest,
  exchangeGoogleCode,
  googleConfigured,
} from '../services/google.js';
import { logger } from '../utils/logger.js';

// Token chỉ nằm trong cookie httpOnly, KHÔNG trả về body để tránh lộ qua XSS
const authPayload = ({ user }) => ({ user: user.toSafeJSON() });

const requestMeta = (req) => ({
  userAgent: req.get('user-agent') || '',
  ip: req.ip || '',
});

export async function register(req, res) {
  const result = await authService.registerUser(req.body, requestMeta(req));
  setAuthCookies(res, result);
  res.status(201).json({ data: authPayload(result) });
}

export async function login(req, res) {
  const result = await authService.loginUser(req.body, requestMeta(req));
  setAuthCookies(res, result);
  res.json({ data: authPayload(result) });
}

export async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE];
  const result = await authService.rotateSession(token, requestMeta(req));
  setAuthCookies(res, result);
  res.json({ data: { user: result.user.toSafeJSON() } });
}

export async function logout(req, res) {
  await authService.logoutUser(req.sessionId, req.userId);
  clearAuthCookies(res);
  res.json({ data: { ok: true } });
}

/** Endpoint công khai để client biết có hiện nút Google hay không. */
export function providers(req, res) {
  res.json({ data: { google: googleConfigured() } });
}

/** Bắt đầu luồng OAuth: redirect sang Google kèm state + PKCE. */
export function googleStart(req, res) {
  if (!googleConfigured()) {
    return res.status(503).json({
      error: {
        code: 'GOOGLE_NOT_CONFIGURED',
        message: 'Đăng nhập Google chưa được cấu hình trên máy chủ',
      },
    });
  }
  const remember = !['0', 'false'].includes(String(req.query.remember || '').toLowerCase());
  const { url, cookie } = createGoogleAuthRequest({ remember });
  setOAuthCookie(res, cookie);
  return res.redirect(url);
}

export async function googleCallback(req, res) {
  const client = primaryClientOrigin();
  const fail = (reason) => res.redirect(`${client}/login?oauth=error&reason=${encodeURIComponent(reason)}`);
  const stored = readOAuthCookie(req);
  clearOAuthCookie(res);

  if (req.query.error) return fail('denied');
  const { code, state } = req.query;
  if (!code || !state || !stored || stored.state !== state) return fail('invalid_state');

  try {
    const profile = await exchangeGoogleCode(code, stored.verifier);
    const result = await authService.loginWithGoogle(profile, {
      ...requestMeta(req),
      remember: stored.remember !== false,
    });
    setAuthCookies(res, result);
    return res.redirect(`${client}${result.user.onboardingRequired ? '/welcome' : '/'}`);
  } catch (error) {
    logger.warn({ err: error }, 'Đăng nhập Google thất bại');
    const reason = typeof error?.code === 'string' && error.code.startsWith('GOOGLE_')
      ? error.code
      : 'failed';
    return fail(reason);
  }
}

export async function forgotPassword(req, res) {
  const data = await authService.requestPasswordReset(req.body.email);
  res.json({ data });
}

export async function resetPassword(req, res) {
  await authService.resetPassword(req.body.token, req.body.newPassword);
  res.json({ data: { ok: true } });
}
