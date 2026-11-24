import * as authService from '../services/authService.js';
import { getAiUsage } from '../services/ai/quota.js';
import { clearAuthCookies, setAuthCookies } from '../services/tokens.js';

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

export async function markIntroSeen(req, res) {
  const user = await authService.markIntroSeen(req.userId);
  res.json({ data: { user: user.toSafeJSON(), age: user.age() } });
}

export async function changePassword(req, res) {
  const result = await authService.changePassword(req.userId, req.sessionId, req.body);
  setAuthCookies(res, result);
  res.json({
    data: {
      user: result.user.toSafeJSON(),
      age: result.user.age(),
      sessionsRevoked: result.sessionsRevoked,
    },
  });
}

export async function listSessions(req, res) {
  const sessions = await authService.listSessions(req.userId, req.sessionId);
  res.json({ data: { sessions } });
}

export async function revokeSession(req, res) {
  const result = await authService.revokeSession(req.userId, req.params.id);
  if (!result.revoked) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy phiên' } });
  if (String(req.params.id) === String(req.sessionId)) clearAuthCookies(res);
  res.json({ data: { ...result, current: String(req.params.id) === String(req.sessionId) } });
}

export async function revokeOtherSessions(req, res) {
  const result = await authService.revokeOtherSessions(req.userId, req.sessionId);
  res.json({ data: result });
}

export async function deleteMe(req, res) {
  await authService.deleteAccount(req.userId, req.body?.password);
  clearAuthCookies(res);
  res.json({ data: { ok: true } });
}
