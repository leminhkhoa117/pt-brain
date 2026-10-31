import { Note } from '../models/Note.js';
import { noteSchema } from '../validation/summary.js';
import { noteUpdateSchema } from '../validation/learning.js';
import { ApiError } from '../utils/ApiError.js';
import { escapeRegex } from '../utils/regex.js';

export async function create(req, res) {
  const data = noteSchema.parse(req.body);
  const note = await Note.create({ ...data, userId: req.userId });
  res.status(201).json({ data: { note } });
}

export async function list(req, res) {
  const query = { userId: req.userId };
  if (req.query.q) query.text = { $regex: escapeRegex(String(req.query.q).slice(0, 100)), $options: 'i' };
  const notes = await Note.find(query).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ data: { notes } });
}

export async function update(req, res) {
  const data = noteUpdateSchema.parse(req.body);
  const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
  if (!note) throw ApiError.notFound('Không tìm thấy ghi chú');
  Object.assign(note, data);
  await note.save();
  res.json({ data: { note } });
}

export async function remove(req, res) {
  const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!note) throw ApiError.notFound('Không tìm thấy ghi chú');
  res.json({ data: { ok: true } });
}
