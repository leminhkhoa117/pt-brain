import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Meal } from '../models/Meal.js';
import { getUser } from '../services/authService.js';
import { assertAiQuota, recordAiCall } from '../services/ai/quota.js';
import { visionCompletion, parseJsonLoose } from '../services/ai/client.js';
import { mealAnalysisSchema, mealFormSchema } from '../validation/vision.js';
import { formatEvidence, getEvidence } from '../research/evidenceBase.js';
import { ApiError } from '../utils/ApiError.js';
import { todayKeyVN } from '../utils/date.js';
import { saveImageFile, removeImageFile } from '../utils/image.js';

const DIR = fileURLToPath(new URL('../../uploads/meals/', import.meta.url));

const SYSTEM = `Bạn là chuyên gia dinh dưỡng phân tích ảnh bữa ăn cho người Việt.
- Nhận diện từng món nhìn thấy; nêu khẩu phần ước tính bằng đơn vị quen thuộc (bát, thìa, gram, miếng).
- Ước tính calo, protein, carb, fat cho từng món và tổng. Luôn nêu giả định (dầu, sốt, đường, phần cơm...).
- Đây là ƯỚC LƯỢNG từ ảnh, sai số có thể lớn. Không khẳng định chính xác tuyệt đối.
- Nếu ảnh mờ/không rõ món, nói rõ và confidence low.
- Không đưa lời khuyên y tế cá nhân.
- BẰNG CHỨNG THAM KHẢO: ${formatEvidence(getEvidence(['E9']))}

Trả về CHỈ JSON:
{
  "items": [
    {"name":"...","portion":"...","calories":0,"proteinG":0,"carbsG":0,"fatG":0,"confidence":"low|medium|high"}
  ],
  "confidence":"low|medium|high",
  "assumptions":["..."],
  "caveats":["..."],
  "disclaimer":"..."
}`;

async function analyzeMeal({ image, description, mealType, user }) {
  const text = `Bữa: ${mealType}. Mô tả của người dùng: ${description || 'không có'}. Mục tiêu: ${
    user.profile?.goal || 'maintain'
  }. Hãy phân tích ảnh và trả JSON.`;

  let lastError;
  for (let attempt = 0; attempt <= 1; attempt += 1) {
    const response = await visionCompletion({
      system: SYSTEM,
      text: `${text}${attempt ? `\nLần trước lỗi JSON: ${lastError.message}. Trả lại đúng JSON.` : ''}`,
      images: [{ buffer: image.buffer, mime: image.mimetype }],
      maxTokens: 3000,
      sessionId: randomUUID(),
    });
    try {
      const parsed = mealAnalysisSchema.parse(parseJsonLoose(response.text));
      return { analysis: parsed, usage: response.usage, model: response.model };
    } catch (error) {
      lastError = error;
    }
  }
  throw new ApiError(502, 'AI_INVALID_OUTPUT', `AI trả về dữ liệu bữa ăn không hợp lệ: ${lastError.message}`);
}

function withTotals(analysis) {
  const totals = analysis.items.reduce(
    (sum, item) => ({
      calories: sum.calories + (Number(item.calories) || 0),
      proteinG: sum.proteinG + (Number(item.proteinG) || 0),
      carbsG: sum.carbsG + (Number(item.carbsG) || 0),
      fatG: sum.fatG + (Number(item.fatG) || 0),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
  return {
    ...analysis,
    totals: {
      calories: Math.round(totals.calories),
      proteinG: Math.round(totals.proteinG * 10) / 10,
      carbsG: Math.round(totals.carbsG * 10) / 10,
      fatG: Math.round(totals.fatG * 10) / 10,
    },
  };
}

export async function create(req, res) {
  const form = mealFormSchema.parse(req.body || {});
  if (!req.file) throw ApiError.badRequest('Cần ảnh bữa ăn');

  const user = await getUser(req.userId);
  const mealType = form.mealType || 'lunch';
  const filename = await saveImageFile(req.file.buffer, DIR, `${req.userId}-${Date.now()}`);

  try {
    await assertAiQuota(req.userId, 'vision');
    const result = await analyzeMeal({
      image: req.file,
      description: form.description,
      mealType,
      user,
    });
    await recordAiCall(req.userId, { kind: 'vision', usage: result.usage });

    const meal = await Meal.create({
      userId: req.userId,
      dateKey: form.dateKey || todayKeyVN(),
      mealType,
      description: form.description,
      notes: form.notes,
      image: { filename },
      analysis: withTotals(result.analysis),
      model: result.model,
    });
    res.status(201).json({ data: { meal } });
  } catch (error) {
    await removeImageFile(DIR, filename);
    throw error;
  }
}

export async function list(req, res) {
  const query = { userId: req.userId };
  if (req.query.date) query.dateKey = req.query.date;
  else if (req.query.from || req.query.to) {
    query.dateKey = {
      ...(req.query.from ? { $gte: String(req.query.from) } : {}),
      ...(req.query.to ? { $lte: String(req.query.to) } : {}),
    };
  }
  const meals = await Meal.find(query).sort({ dateKey: -1, createdAt: -1 }).limit(100).lean();
  res.json({ data: { meals } });
}

export async function summary(req, res) {
  const dateKey = req.query.date || todayKeyVN();
  const meals = await Meal.find({ userId: req.userId, dateKey }).lean();
  const totals = meals.reduce(
    (sum, meal) => ({
      calories: sum.calories + (meal.analysis?.totals?.calories || 0),
      proteinG: sum.proteinG + (meal.analysis?.totals?.proteinG || 0),
      carbsG: sum.carbsG + (meal.analysis?.totals?.carbsG || 0),
      fatG: sum.fatG + (meal.analysis?.totals?.fatG || 0),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
  res.json({ data: { dateKey, meals: meals.length, totals } });
}

export async function update(req, res) {
  const allowed = {};
  for (const key of ['mealType', 'description', 'notes']) {
    if (req.body?.[key] !== undefined) allowed[key] = String(req.body[key]).slice(0, 2000);
  }
  const meal = await Meal.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: allowed },
    { new: true },
  );
  if (!meal) throw ApiError.notFound('Không tìm thấy bữa ăn');
  res.json({ data: { meal } });
}

export async function remove(req, res) {
  const meal = await Meal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!meal) throw ApiError.notFound('Không tìm thấy bữa ăn');
  await removeImageFile(DIR, meal.image?.filename);
  res.json({ data: { ok: true } });
}

export async function servePhoto(req, res) {
  const meal = await Meal.findOne({
    _id: req.params.id,
    userId: req.userId,
  }).lean();
  if (!meal?.image?.filename) throw ApiError.notFound('Không tìm thấy ảnh');
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.sendFile(path.join(DIR, meal.image.filename));
}
