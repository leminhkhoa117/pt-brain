import { AI_TIMEOUT_MS, api, unwrap } from './client.js';
import { streamSseJson } from './sse.js';

export const getCurriculum = () => api.get('/curriculum').then(unwrap);

export const getLesson = (slug) => api.get(`/curriculum/lessons/${slug}`).then(unwrap);

export const markLessonProgress = (slug, status) =>
  api.put(`/curriculum/progress/${slug}`, { status }).then(unwrap);

export const submitLessonQuiz = (slug, answers) =>
  api.post(`/curriculum/lessons/${slug}/quiz`, { answers }).then(unwrap);

export const generateLessonQuizAi = (slug, count = 5) =>
  api
    .post(`/curriculum/lessons/${slug}/quiz-ai`, { count }, { timeout: AI_TIMEOUT_MS })
    .then(unwrap);

/** Chat hỏi đáp theo bài học, dạng stream như chat cơ bắp. */
export const askLessonCoachStream = ({ slug, message, history, onDelta, signal }) =>
  streamSseJson(`/curriculum/lessons/${slug}/ask/stream`, {
    body: { message, history },
    signal,
    onDelta,
  });

export const askLessonCoach = (payload) =>
  api
    .post(`/curriculum/lessons/${payload.slug}/ask`, payload, { timeout: AI_TIMEOUT_MS })
    .then(unwrap);
