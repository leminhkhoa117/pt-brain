import { api, unwrap } from './client.js';

export const loginRequest = (body) => api.post('/auth/login', body).then(unwrap);
export const registerRequest = (body) => api.post('/auth/register', body).then(unwrap);
export const logoutRequest = () => api.post('/auth/logout').then(unwrap);
export const fetchMe = () => api.get('/me').then(unwrap);
export const updateMe = (body) => api.patch('/me', body).then(unwrap);
export const fetchAiUsage = () => api.get('/me/ai-usage').then(unwrap);
export const markWelcomeSeen = () => api.post('/me/welcome-seen').then(unwrap);
export const deleteAccount = () => api.delete('/me').then(unwrap);
