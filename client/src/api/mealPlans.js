import { AI_TIMEOUT_MS, api, unwrap } from './client.js';

export const aiSuggestMealPlan = (payload) =>
  api.post('/meal-plans/suggest-ai', payload, { timeout: AI_TIMEOUT_MS }).then(unwrap);

export const listMealPlans = () => api.get('/meal-plans').then(unwrap);

export const createMealPlan = (payload) => api.post('/meal-plans', payload).then(unwrap);

export const updateMealPlan = (id, payload) => api.put(`/meal-plans/${id}`, payload).then(unwrap);

export const getMealPlanAdherence = (id, weekStart) =>
  api.get(`/meal-plans/${id}/adherence`, { params: weekStart ? { weekStart } : {} }).then(unwrap);

export const listMealPlanReviews = (id) => api.get(`/meal-plans/${id}/reviews`).then(unwrap);

export const evaluateMealPlanWeek = (id, weekStart) =>
  api.post(`/meal-plans/${id}/reviews`, { weekStart }, { timeout: AI_TIMEOUT_MS }).then(unwrap);

export const activateMealPlan = (id) => api.post(`/meal-plans/${id}/activate`).then(unwrap);

export const deleteMealPlan = (id) => api.delete(`/meal-plans/${id}`).then(unwrap);
