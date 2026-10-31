import { api, unwrap } from './client.js';

export const listExercises = (params = {}) =>
  api.get('/exercises', { params }).then(unwrap);

export const suggestProgram = (payload) =>
  api.post('/programs/suggest', payload).then(unwrap);
export const listPrograms = () => api.get('/programs').then(unwrap);
export const getProgram = (id) => api.get(`/programs/${id}`).then(unwrap);
export const createProgram = (payload) =>
  api.post('/programs', payload).then(unwrap);
export const updateProgram = (id, payload) =>
  api.patch(`/programs/${id}`, payload).then(unwrap);
export const deleteProgram = (id) => api.delete(`/programs/${id}`).then(unwrap);
export const getProgramVolume = (id) =>
  api.get(`/programs/${id}/volume`).then(unwrap);
export const getSuggestions = (id, dayName) =>
  api
    .get(`/programs/${id}/suggestions`, { params: dayName ? { dayName } : {} })
    .then(unwrap);

export const listWorkouts = (params = {}) =>
  api.get('/workouts', { params }).then(unwrap);
export const createWorkout = (payload) =>
  api.post('/workouts', payload).then(unwrap);
export const updateWorkout = (id, payload) =>
  api.patch(`/workouts/${id}`, payload).then(unwrap);
export const deleteWorkout = (id) => api.delete(`/workouts/${id}`).then(unwrap);
export const getProgression = (exercise) =>
  api.get(`/workouts/progression/${encodeURIComponent(exercise)}`).then(unwrap);
