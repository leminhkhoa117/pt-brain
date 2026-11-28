import { findResearch } from '../services/research/finder.js';
import { getGraph } from '../services/research/graph.js';
import { getLegalFullTextCandidates } from '../services/research/metadata.js';
import { synthesizeFromFullText } from '../services/research/synthesize.js';
import { getUser } from '../services/authService.js';
import { getAiUsage } from '../services/ai/quota.js';
import {
  researchFullTextSchema,
  researchGraphSchema,
  researchSearchSchema,
  researchSynthesizeSchema,
} from '../validation/research.js';

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

/** Chỉ trả các đường đọc hợp pháp; không tải PDF và không dùng Sci-Hub. */
export async function fullText(req, res) {
  const input = researchFullTextSchema.parse(req.query);
  const result = await getLegalFullTextCandidates(input.doi);
  res.json({ data: result });
}

/** Tổng hợp theo yêu cầu từ các Summary đã tạo bằng toàn văn. */
export async function synthesize(req, res) {
  const input = researchSynthesizeSchema.parse(req.body);
  const result = await synthesizeFromFullText(req.userId, input);
  res.json({ data: { ...result, quota: await getAiUsage(req.userId) } });
}
