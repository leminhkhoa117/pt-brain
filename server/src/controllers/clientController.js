import { Client } from '../models/Client.js';
import { Program } from '../models/Program.js';
import { ApiError } from '../utils/ApiError.js';
import { clientCreateSchema, clientUpdateSchema } from '../validation/client.js';
import { escapeRegex } from '../utils/regex.js';

function normalizePayload(data) {
  const payload = { ...data };
  if (payload.programId === '') delete payload.programId;
  if (payload.birthDate === '') delete payload.birthDate;
  if (payload.birthDate) payload.birthDate = new Date(`${payload.birthDate}T00:00:00Z`);
  if (payload.startDate) payload.startDate = new Date(`${payload.startDate}T00:00:00Z`);
  if (payload.lastCheckIn) payload.lastCheckIn = new Date(`${payload.lastCheckIn}T00:00:00Z`);
  return payload;
}

export async function list(req, res) {
  const query = { ownerId: req.userId };
  if (req.query.status) query.status = String(req.query.status).slice(0, 20);
  if (req.query.q) {
    const safe = escapeRegex(String(req.query.q).slice(0, 80));
    query.$or = [{ name: { $regex: safe, $options: 'i' } }, { email: { $regex: safe, $options: 'i' } }];
  }
  const clients = await Client.find(query)
    .sort({ status: 1, name: 1 })
    .populate('programId', 'name daysPerWeek split')
    .lean();
  res.json({ data: { clients } });
}

export async function create(req, res) {
  const data = clientCreateSchema.parse(req.body);
  if (data.programId) {
    const program = await Program.findOne({ _id: data.programId, userId: req.userId });
    if (!program) throw ApiError.badRequest('Giáo án không tồn tại');
  }
  const client = await Client.create({ ...normalizePayload(data), ownerId: req.userId });
  res.status(201).json({ data: { client } });
}

export async function getOne(req, res) {
  const client = await Client.findOne({ _id: req.params.id, ownerId: req.userId })
    .populate('programId', 'name daysPerWeek split')
    .lean();
  if (!client) throw ApiError.notFound('Không tìm thấy khách hàng');
  res.json({ data: { client } });
}

export async function update(req, res) {
  const data = clientUpdateSchema.parse(req.body);
  const client = await Client.findOne({ _id: req.params.id, ownerId: req.userId });
  if (!client) throw ApiError.notFound('Không tìm thấy khách hàng');
  if (data.programId) {
    const program = await Program.findOne({ _id: data.programId, userId: req.userId });
    if (!program) throw ApiError.badRequest('Giáo án không tồn tại');
  }
  Object.assign(client, normalizePayload(data));
  await client.save();
  res.json({ data: { client } });
}

export async function remove(req, res) {
  const client = await Client.findOneAndDelete({ _id: req.params.id, ownerId: req.userId });
  if (!client) throw ApiError.notFound('Không tìm thấy khách hàng');
  res.json({ data: { ok: true } });
}
