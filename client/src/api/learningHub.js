import { api, unwrap } from './client.js';

function cleanParams(params = {}) {
  const out = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    const text = Array.isArray(value) ? value.join(',') : String(value);
    out[key] = key === 'query' ? text.slice(0, 200) : text;
  }
  return out;
}

export const getLearningRecommendations = ({ surface, context = {}, limit = 3 } = {}) =>
  api
    .get('/learning/recommendations', {
      params: cleanParams({
        surface,
        limit,
        goal: context.goal,
        experience: context.experience,
        conditions: context.conditions,
        muscles: context.muscles,
        exercises: context.exercises,
        calculator: context.calculator,
        anatomyGroup: context.anatomyGroup,
        region: context.region,
        query: context.query,
      }),
    })
    .then(unwrap);

export const getLearningNext = () => api.get('/learning/next').then(unwrap);
export const getLearningSummary = () => api.get('/learning/summary').then(unwrap);

export const applyLearningAction = (slug, payload) =>
  api.post(`/learning/lessons/${slug}/apply`, payload).then(unwrap);

export const dismissLearningRecommendation = (payload) =>
  api.post('/learning/dismiss', payload).then(unwrap);

export const trackLearningEvent = (payload) =>
  api.post('/learning/track', payload).then(unwrap);
