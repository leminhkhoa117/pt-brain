import * as authService from '../services/authService.js';
import { getAiUsage } from '../services/ai/quota.js';
import { clearAuthCookies } from '../services/tokens.js';

export async function getMe(req, res) {
  const user = await authService.getUser(req.userId);
  res.json({ data: { user: user.toSafeJSON(), age: user.age() } });
}

export async function updateMe(req, res) {
  const user = await authService.updateUser(req.userId, req.body);
  res.json({ data: { user: user.toSafeJSON(), age: user.age() } });
}

export async function getMyAiUsage(req, res) {
  res.json({ data: await getAiUsage(req.userId) });
}

export async function deleteMe(req, res) {
  await authService.deleteAccount(req.userId);
  clearAuthCookies(res);
  res.json({ data: { ok: true } });
}
