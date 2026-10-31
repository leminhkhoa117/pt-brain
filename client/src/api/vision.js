import { api, unwrap } from './client.js';

export const analyzeBody = async ({ files, views, goal, notes }) => {
  const form = new FormData();
  for (const file of files) form.append('photos', file);
  form.append('views', JSON.stringify(views));
  if (goal) form.append('goal', goal);
  if (notes) form.append('notes', notes);
  return api
    .post('/body-assessments', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then(unwrap);
};

export const listBodyAssessments = () =>
  api.get('/body-assessments').then(unwrap);
export const deleteBodyAssessment = (id) =>
  api.delete(`/body-assessments/${id}`).then(unwrap);
export const bodyAssessmentPhotoUrl = (id, filename) =>
  `${api.defaults.baseURL}/body-assessments/${id}/photos/${filename}`;

export const createMeal = async ({ file, mealType, description, notes, dateKey }) => {
  const form = new FormData();
  form.append('photo', file);
  form.append('mealType', mealType);
  form.append('description', description || '');
  form.append('notes', notes || '');
  if (dateKey) form.append('dateKey', dateKey);
  return api
    .post('/meals', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then(unwrap);
};
export const listMeals = (date) => api.get('/meals', { params: { date } }).then(unwrap);
export const mealSummary = (date) =>
  api.get('/meals/summary', { params: { date } }).then(unwrap);
export const updateMeal = (id, payload) => api.patch(`/meals/${id}`, payload).then(unwrap);
export const deleteMeal = (id) => api.delete(`/meals/${id}`).then(unwrap);
export const mealPhotoUrl = (id) => `${api.defaults.baseURL}/meals/${id}/photo`;
