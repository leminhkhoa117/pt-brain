import { findResearch } from '../services/research/finder.js';
import { getGraph } from '../services/research/graph.js';
import { getUser } from '../services/authService.js';
import { getAiUsage } from '../services/ai/quota.js';
import { researchGraphSchema, researchSearchSchema } from '../validation/research.js';

export async function search(req, res) {
  const input = researchSearchSchema.parse(req.body);
  const user = await getUser(req.userId);
  const result = await findResearch(user, input);
  res.json({ data: { ...result, quota: await getAiUsage(req.userId) } });
}

export async function graph(req, res) {
  const input = researchGraphSchema.parse(req.query);
  const result = await getGraph(input.doi, input.kind, input.limit);
  res.json({ data: result });
}
