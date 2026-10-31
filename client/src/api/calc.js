import { api, unwrap } from './client.js';

export const runCalc = (type, input, save = false) =>
  api.post(`/calc/${type}`, input, { params: save ? { save: true } : {} }).then(unwrap);

export const fetchCalcHistory = () => api.get('/calc/history').then(unwrap);
