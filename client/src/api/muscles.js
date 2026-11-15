import { AI_TIMEOUT_MS, api, unwrap } from './client.js';
import { streamSseJson } from './sse.js';

export const askMuscleCoach = (payload) =>
  api.post('/muscles/chat', payload, { timeout: AI_TIMEOUT_MS }).then(unwrap);

/** Chat cơ bắp dạng stream, cùng cơ chế SSE với trang nghiên cứu. */
export const askMuscleCoachStream = ({ slug, message, history, onDelta, signal }) =>
  streamSseJson('/muscles/chat/stream', {
    body: { slug, message, history },
    signal,
    onDelta,
  });
