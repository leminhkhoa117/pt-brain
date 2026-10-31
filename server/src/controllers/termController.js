import { Term } from '../models/Term.js';
import { termSchema } from '../validation/summary.js';
import { termUpdateSchema } from '../validation/learning.js';
import { ApiError } from '../utils/ApiError.js';

export async function create(req, res) {
  const data = termSchema.parse(req.body);
  const existing = await Term.findOne({ userId: req.userId, en: data.en });
  if (existing) {
    existing.vi = data.vi;
    existing.explanation = data.explanation;
    existing.example = data.example;
    if (data.sourcePaperId) existing.sourcePaperId = data.sourcePaperId;
    await existing.save();
    return res.json({ data: { term: existing, existed: true } });
  }
  const term = await Term.create({ ...data, userId: req.userId });
  return res.status(201).json({ data: { term, existed: false } });
}

export async function list(req, res) {
  const terms = await Term.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
  res.json({ data: { terms } });
}

export async function update(req, res) {
  const data = termUpdateSchema.parse(req.body);
  const term = await Term.findOne({ _id: req.params.id, userId: req.userId });
  if (!term) throw ApiError.notFound('Không tìm thấy thuật ngữ');
  Object.assign(term, data);
  await term.save();
  res.json({ data: { term } });
}

export async function remove(req, res) {
  const term = await Term.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!term) throw ApiError.notFound('Không tìm thấy thuật ngữ');
  res.json({ data: { ok: true } });
}
