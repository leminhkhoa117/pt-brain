import { Paper } from '../models/Paper.js';
import { Summary } from '../models/Summary.js';
import { ApiError } from '../utils/ApiError.js';
import { paperCreateSchema } from '../validation/research.js';
import { escapeRegex } from '../utils/regex.js';
import { removeOrphanPdfs } from '../services/userFiles.js';

export async function create(req, res) {
  const data = paperCreateSchema.parse(req.body);
  const existing = data.doi
    ? await Paper.findOne({ userId: req.userId, doi: data.doi.toLowerCase() })
    : null;
  if (existing) {
    return res.json({ data: { paper: existing, existed: true } });
  }
  const paper = await Paper.create({
    ...data,
    doi: data.doi ? data.doi.toLowerCase() : '',
    userId: req.userId,
  });
  return res.status(201).json({ data: { paper, existed: false } });
}

export async function list(req, res) {
  const query = { userId: req.userId };
  if (req.query.q) {
    const safe = escapeRegex(String(req.query.q).slice(0, 100));
    query.$or = [
      { title: { $regex: safe, $options: 'i' } },
      { authors: { $regex: safe, $options: 'i' } },
    ];
  }
  const papers = await Paper.find(query).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ data: { papers } });
}

export async function getOne(req, res) {
  const paper = await Paper.findOne({ _id: req.params.id, userId: req.userId }).lean();
  if (!paper) throw ApiError.notFound('Không tìm thấy bài báo');
  res.json({ data: { paper } });
}

export async function remove(req, res) {
  const paper = await Paper.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!paper) throw ApiError.notFound('Không tìm thấy bài báo');
  const summaries = await Summary.find({ userId: req.userId, paperId: paper._id })
    .select('pdfHash')
    .lean();
  await Summary.deleteMany({ userId: req.userId, paperId: paper._id });
  await removeOrphanPdfs(summaries.map((summary) => summary.pdfHash));
  res.json({ data: { ok: true } });
}
