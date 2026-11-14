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
export const markSummaryReviewed = (id) =>
  api.post(`/summaries/${id}/review`).then(unwrap);
export const updateSummaryMeta = (id, payload) =>
  api.patch(`/summaries/${id}`, payload).then(unwrap);
export const askSummary = (id, question) =>
  api
    .post(`/summaries/${id}/ask`, { question }, { timeout: AI_TIMEOUT_MS })
    .then(unwrap);

/**
 * Hỏi đáp dạng stream. Dùng fetch để đọc ReadableStream (axios không stream
 * body trong browser). onDelta nhận từng đoạn text; trả về câu đầy đủ.
 */
export async function askSummaryStream(id, question, { onDelta, signal } = {}) {
  const url = `${api.defaults.baseURL}/summaries/${id}/ask/stream`;
  const request = () =>
    fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ question }),
      signal,
    });

  let response = await request();
  if (response.status === 401) {
    await api.post('/auth/refresh');
    response = await request();
  }
  if (!response.ok) {
    let message = `Không gửi được câu hỏi (HTTP ${response.status})`;
    try {
      const body = await response.json();
      message = body?.error?.message || message;
    } catch {
      // body lỗi không phải JSON
    }
    throw new Error(message);
  }
  if (!response.body) throw new Error('Trình duyệt không hỗ trợ đọc stream');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let answer = '';
  let finalPayload = null;

  const handleBlock = (block) => {
    const lines = block.split('\n');
    let event = 'message';
    const dataLines = [];
    for (const line of lines) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
    }
    if (!dataLines.length) return;
    let payload;
    try {
      payload = JSON.parse(dataLines.join('\n'));
    } catch {
      return;
    }
    if (event === 'delta' && typeof payload.text === 'string') {
      answer += payload.text;
      onDelta?.(payload.text);
    } else if (event === 'done') {
      finalPayload = payload;
      if (typeof payload.answer === 'string') answer = payload.answer;
    } else if (event === 'error') {
      throw new Error(payload.message || 'AI không trả lời được câu hỏi này');
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, '\n');
      let boundary;
      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        handleBlock(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + 2);
      }
    }
    if (buffer.trim()) handleBlock(buffer);
  } finally {
    reader.releaseLock?.();
  }

  return { answer: finalPayload?.answer || answer, ...finalPayload };
}
export const translateSummary = (id) =>
  api.post(`/summaries/${id}/translate`, null, { timeout: AI_TIMEOUT_MS }).then(unwrap);
export const summaryExportUrl = (id) =>
  `${api.defaults.baseURL}/summaries/${id}/export.md`;
export const summaryPdfUrl = (id) =>
  `${api.defaults.baseURL}/summaries/${id}/export.pdf`;
export const summaryTranslationUrl = (id) =>
  `${api.defaults.baseURL}/summaries/${id}/export-translation.txt`;
export const summaryCitationUrl = (id, format = 'bibtex') =>
  `${api.defaults.baseURL}/summaries/${id}/citation?format=${encodeURIComponent(format)}`;
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
export const getResearchGraph = (params) =>
  api.get('/research/graph', { params }).then(unwrap);
export const applyToPlan = (summaryId, programId) =>
  api
    .post(`/summaries/${summaryId}/apply-to-plan`, { programId }, { timeout: AI_TIMEOUT_MS })
    .then(unwrap);
export const applyPlanChanges = (programId, changes) =>
  api.post(`/programs/${programId}/apply-changes`, { changes }).then(unwrap);
