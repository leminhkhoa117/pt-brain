import { findResearch } from '../services/research/finder.js';
import { getUser } from '../services/authService.js';
import { getAiUsage } from '../services/ai/quota.js';
import { researchSearchSchema } from '../validation/research.js';

export async function search(req, res) {
  const input = researchSearchSchema.parse(req.body);
  const user = await getUser(req.userId);
  const result = await findResearch(user, input);
  res.json({ data: { ...result, quota: await getAiUsage(req.userId) } });
}
