import { AI_TIMEOUT_MS, api, unwrap } from './client.js';

export const askMuscleCoach = (payload) =>
  api.post('/muscles/chat', payload, { timeout: AI_TIMEOUT_MS }).then(unwrap);
