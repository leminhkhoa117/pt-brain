import * as authService from '../services/authService.js';
import { setAuthCookies, clearAuthCookies, REFRESH_COOKIE } from '../services/tokens.js';

// Token chỉ nằm trong cookie httpOnly, KHÔNG trả về body để tránh lộ qua XSS
const authPayload = ({ user }) => ({ user: user.toSafeJSON() });

export async function register(req, res) {
  const result = await authService.registerUser(req.body);
  setAuthCookies(res, result);
  res.status(201).json({ data: authPayload(result) });
}

export async function login(req, res) {
  const result = await authService.loginUser(req.body);
  setAuthCookies(res, result);
  res.json({ data: authPayload(result) });
}

export async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE];
  const result = await authService.rotateSession(token);
  setAuthCookies(res, result);
  res.json({ data: { user: result.user.toSafeJSON() } });
}

export async function logout(req, res) {
  await authService.logoutUser(req.userId);
  clearAuthCookies(res);
  res.json({ data: { ok: true } });
}
