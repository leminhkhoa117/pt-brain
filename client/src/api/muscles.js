import { AI_TIMEOUT_MS, api, unwrap } from './client.js';
import { streamSseJson } from './sse.js';

export const askMuscleCoach = ({ kind, slug, id, name, message, history }) =>
  api
    .post('/muscles/chat', { kind, slug, id, name, message, history }, { timeout: AI_TIMEOUT_MS })
    .then(unwrap);

/** Chat giải phẫu dạng stream, cùng cơ chế SSE với trang nghiên cứu. */
export const askMuscleCoachStream = ({
  kind = 'muscle',
  slug,
  id,
  name,
  message,
  history,
  onDelta,
  signal,
}) =>
  streamSseJson('/muscles/chat/stream', {
    body: { kind, slug, id, name, message, history },
    signal,
    onDelta,
  });
