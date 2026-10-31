import { api, unwrap } from './client.js';

export const createSummary = ({ file, title, doi, url, text }) => {
  if (file) {
    const form = new FormData();
    form.append('file', file);
    if (title) form.append('title', title);
    return api
      .post('/summaries', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(unwrap);
  }
  return api.post('/summaries', { doi, url, text, title }).then(unwrap);
};

export const listSummaries = (params = {}) =>
  api.get('/summaries', { params }).then(unwrap);
export const getSummary = (id) => api.get(`/summaries/${id}`).then(unwrap);
export const deleteSummary = (id) => api.delete(`/summaries/${id}`).then(unwrap);
export const retrySummary = (id) => api.post(`/summaries/${id}/retry`).then(unwrap);
export const updateSummaryMeta = (id, payload) =>
  api.patch(`/summaries/${id}`, payload).then(unwrap);
export const askSummary = (id, question) =>
  api.post(`/summaries/${id}/ask`, { question }).then(unwrap);
export const summaryExportUrl = (id) =>
  `${api.defaults.baseURL}/summaries/${id}/export.md`;
export const summaryPdfUrl = (id) =>
  `${api.defaults.baseURL}/summaries/${id}/export.pdf`;
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
export const searchResearch = (payload) => api.post('/research/search', payload).then(unwrap);
export const applyToPlan = (summaryId, programId) =>
  api.post(`/summaries/${summaryId}/apply-to-plan`, { programId }).then(unwrap);
export const applyPlanChanges = (programId, changes) =>
  api.post(`/programs/${programId}/apply-changes`, { changes }).then(unwrap);
