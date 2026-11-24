import { api, unwrap } from './client.js';

export const loginRequest = (body) => api.post('/auth/login', body).then(unwrap);
export const registerRequest = (body) => api.post('/auth/register', body).then(unwrap);
export const logoutRequest = () => api.post('/auth/logout').then(unwrap);
export const refreshRequest = () => api.post('/auth/refresh').then(unwrap);
export const fetchMe = () => api.get('/me').then(unwrap);
export const updateMe = (body) => api.patch('/me', body).then(unwrap);
export const fetchAiUsage = () => api.get('/me/ai-usage').then(unwrap);
export const markWelcomeSeen = () => api.post('/me/welcome-seen').then(unwrap);
export const deleteAccount = (body) => api.delete('/me', { data: body }).then(unwrap);

export const fetchAuthProviders = () => api.get('/auth/providers').then(unwrap);
export const forgotPasswordRequest = (body) => api.post('/auth/forgot-password', body).then(unwrap);
export const resetPasswordRequest = (body) => api.post('/auth/reset-password', body).then(unwrap);
export const changePasswordRequest = (body) => api.post('/me/password', body).then(unwrap);

export const fetchSessions = () => api.get('/me/sessions').then(unwrap);
export const revokeSession = (id) => api.delete(`/me/sessions/${id}`).then(unwrap);
export const revokeOtherSessions = () => api.delete('/me/sessions').then(unwrap);

/** URL để trình duyệt chuyển sang Google; dùng chung proxy /api của client. */
export function googleLoginUrl(remember = true) {
  const base = String(api.defaults.baseURL || '/api').replace(/\/$/, '');
  return `${base}/auth/google/start?remember=${remember ? '1' : '0'}`;
}
