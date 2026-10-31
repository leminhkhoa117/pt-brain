import { api, unwrap } from './client.js';

export const listFlashcards = (due = false) =>
  api.get('/flashcards', { params: due ? { due: 'true' } : {} }).then(unwrap);
export const createFlashcard = (payload) => api.post('/flashcards', payload).then(unwrap);
export const updateFlashcard = (id, payload) =>
  api.patch(`/flashcards/${id}`, payload).then(unwrap);
export const deleteFlashcard = (id) => api.delete(`/flashcards/${id}`).then(unwrap);
export const reviewFlashcard = (id, quality) =>
  api.post(`/flashcards/${id}/review`, { quality }).then(unwrap);

export const generateQuiz = (payload) => api.post('/quizzes', payload).then(unwrap);
