import { api, unwrap } from './client.js';

export const fetchSummary = (days = 90) =>
  api.get('/metrics/summary', { params: { days } }).then(unwrap);

export const fetchMetrics = (params = {}) => api.get('/metrics', { params }).then(unwrap);

export const fetchMetricByDate = (date) =>
  api.get(`/metrics/${date}`).then(unwrap);

export const saveMetric = (date, body) =>
  api.put(`/metrics/${date}`, body).then(unwrap);

export const exportCsvUrl = () => `${api.defaults.baseURL}/metrics/export.csv`;
