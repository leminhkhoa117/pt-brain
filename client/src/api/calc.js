import { api, unwrap } from './client.js';

export const runCalc = (type, input, save = false) =>
  api.post(`/calc/${type}`, input, { params: save ? { save: true } : {} }).then(unwrap);

export const fetchCalcHistory = () => api.get('/calc/history').then(unwrap);
export const deleteCalcHistory = (id) => api.delete(`/calc/history/${id}`).then(unwrap);
export const clearCalcHistory = () => api.delete('/calc/history').then(unwrap);
