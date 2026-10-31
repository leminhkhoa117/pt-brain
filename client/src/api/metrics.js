import { api, unwrap } from './client.js';

export const fetchSummary = (days = 90) =>
  api.get('/metrics/summary', { params: { days } }).then(unwrap);

export const fetchMetrics = (params = {}) => api.get('/metrics', { params }).then(unwrap);

export const fetchMetricByDate = (date) =>
  api.get(`/metrics/${date}`).then(unwrap);

export const saveMetric = (date, body) =>
  api.put(`/metrics/${date}`, body).then(unwrap);

export const exportCsvUrl = () => `${api.defaults.baseURL}/metrics/export.csv`;
export const exportPdfUrl = () => `${api.defaults.baseURL}/metrics/export.pdf`;

export const uploadMetricPhoto = (date, file, note = '') => {
  const form = new FormData();
  form.append('photo', file);
  if (note) form.append('note', note);
  return api
    .post(`/metrics/${date}/photos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(unwrap);
};

export const deleteMetricPhoto = (date, filename) =>
  api.delete(`/metrics/${date}/photos/${filename}`).then(unwrap);

export const metricPhotoUrl = (filename) =>
  `${api.defaults.baseURL}/metrics/photos/${filename}`;
