import { api, unwrap } from './client.js';

// Dịch toàn văn có thể mất 4-5 phút với bài dài; đặt trần cao hơn timeout mặc định.
const AI_TIMEOUT_MS = 420000;

export const createSummary = ({ file, title, doi, url, text }) => {
  if (file) {
    const form = new FormData();
    form.append('file', file);
    if (title) form.append('title', title);
    return api
      .post('/summaries', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: AI_TIMEOUT_MS,
      })
      .then(unwrap);
  }
  return api
    .post('/summaries', { doi, url, text, title }, { timeout: AI_TIMEOUT_MS })
    .then(unwrap);
};

export const listSummaries = (params = {}) =>
  api.get('/summaries', { params }).then(unwrap);
export const getSummary = (id) => api.get(`/summaries/${id}`).then(unwrap);
export const deleteSummary = (id) => api.delete(`/summaries/${id}`).then(unwrap);
export const retrySummary = (id) =>
  api.post(`/summaries/${id}/retry`, null, { timeout: AI_TIMEOUT_MS }).then(unwrap);
export const updateSummaryMeta = (id, payload) =>
  api.patch(`/summaries/${id}`, payload).then(unwrap);
export const askSummary = (id, question) =>
  api
    .post(`/summaries/${id}/ask`, { question }, { timeout: AI_TIMEOUT_MS })
    .then(unwrap);
export const translateSummary = (id) =>
  api.post(`/summaries/${id}/translate`, null, { timeout: AI_TIMEOUT_MS }).then(unwrap);
export const summaryExportUrl = (id) =>
  `${api.defaults.baseURL}/summaries/${id}/export.md`;
export const summaryPdfUrl = (id) =>
  `${api.defaults.baseURL}/summaries/${id}/export.pdf`;
export const summaryTranslationUrl = (id) =>
  `${api.defaults.baseURL}/summaries/${id}/export-translation.txt`;
export const summarySourcePdfUrl = (id) =>
  `${api.defaults.baseURL}/summaries/${id}/source.pdf`;
export const clearSummaryChat = (id) =>
  api.delete(`/summaries/${id}/chat`).then(unwrap);

export const createTerm = (payload) => api.post('/terms', payload).then(unwrap);
export const listTerms = () => api.get('/terms').then(unwrap);
export const updateTerm = (id, payload) => api.patch(`/terms/${id}`, payload).then(unwrap);
export const deleteTerm = (id) => api.delete(`/terms/${id}`).then(unwrap);

export const createNote = (payload) => api.post('/notes', payload).then(unwrap);
export const listNotes = (query = '') =>
  api.get('/notes', { params: query ? { q: query } : {} }).then(unwrap);
export const updateNote = (id, payload) => api.patch(`/notes/${id}`, payload).then(unwrap);
export const deleteNote = (id) => api.delete(`/notes/${id}`).then(unwrap);

export const listPapers = () => api.get('/papers').then(unwrap);
export const createPaper = (payload) => api.post('/papers', payload).then(unwrap);
export const searchResearch = (payload) =>
  api.post('/research/search', payload, { timeout: AI_TIMEOUT_MS }).then(unwrap);
export const applyToPlan = (summaryId, programId) =>
  api
    .post(`/summaries/${summaryId}/apply-to-plan`, { programId }, { timeout: AI_TIMEOUT_MS })
    .then(unwrap);
export const applyPlanChanges = (programId, changes) =>
  api.post(`/programs/${programId}/apply-changes`, { changes }).then(unwrap);
