import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { primaryClientOrigin } from './tokens.js';
import { ApiError } from '../utils/ApiError.js';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

export function googleConfigured() {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

export function googleRedirectUri() {
  return env.GOOGLE_REDIRECT_URI || `${primaryClientOrigin()}/api/auth/google/callback`;
}

/** Sinh state + PKCE (S256), trả về cả payload để lưu cookie tạm. */
export function createGoogleAuthRequest({ remember }) {
  const state = crypto.randomBytes(32).toString('base64url');
  const verifier = crypto.randomBytes(48).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: googleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    access_type: 'online',
    // Không cần refresh token của Google: app tự quản lý phiên.
    prompt: 'select_account',
  });
  return {
    url: `${GOOGLE_AUTH_URL}?${params.toString()}`,
    cookie: { state, verifier, remember: Boolean(remember) },
  };
}

async function readJson(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

/**
 * Đổi authorization code lấy access token rồi đọc userinfo từ Google.
 * Chỉ tin email khi Google trả email_verified=true — nếu không, một tài khoản
 * Google chưa xác minh có thể chiếm email của người khác.
 */
export async function exchangeGoogleCode(code, codeVerifier) {
  if (!googleConfigured()) {
    throw new ApiError(503, 'GOOGLE_NOT_CONFIGURED', 'Đăng nhập Google chưa được cấu hình');
  }
  if (!code || !codeVerifier) {
    throw new ApiError(400, 'GOOGLE_BAD_CALLBACK', 'Thiếu mã xác thực Google');
  }

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: String(code),
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: googleRedirectUri(),
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    }),
    signal: AbortSignal.timeout(10000),
  });
  const token = await readJson(tokenRes);
  if (!tokenRes.ok || !token.access_token) {
    throw new ApiError(401, 'GOOGLE_TOKEN_FAILED', 'Không đổi được mã xác thực Google');
  }

  const infoRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { authorization: `Bearer ${token.access_token}` },
    signal: AbortSignal.timeout(10000),
  });
  const profile = await readJson(infoRes);
  if (!infoRes.ok || !profile.sub) {
    throw new ApiError(401, 'GOOGLE_PROFILE_FAILED', 'Không đọc được thông tin tài khoản Google');
  }
  if (!profile.email || profile.email_verified !== true) {
    throw new ApiError(
      401,
      'GOOGLE_EMAIL_UNVERIFIED',
      'Email Google chưa được xác minh, không thể đăng nhập',
    );
  }

  return {
    sub: String(profile.sub),
    email: String(profile.email).toLowerCase().trim(),
    name: String(profile.name || profile.email.split('@')[0]).slice(0, 80),
    picture: profile.picture ? String(profile.picture).slice(0, 500) : '',
    emailVerified: true,
  };
}
