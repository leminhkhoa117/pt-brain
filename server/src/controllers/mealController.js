import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { Meal } from '../models/Meal.js';
import { getUser } from '../services/authService.js';
import { assertAiQuota, recordAiCall } from '../services/ai/quota.js';
import { visionCompletion, chatCompletion, parseJsonLoose } from '../services/ai/client.js';
import {
  mealAnalysisSchema,
  mealEstimateSchema,
  mealFormSchema,
  manualMealSchema,
  manualMealUpdateSchema,
} from '../validation/vision.js';
import { formatEvidence, getEvidence } from '../research/evidenceBase.js';
import { ApiError } from '../utils/ApiError.js';
import { todayKeyVN } from '../utils/date.js';
import { saveImageFile, removeImageFile, sendImageFile } from '../utils/image.js';
import { sumFoods } from '../../../shared/nutrition/mealPlan.js';

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

const ESTIMATE_SYSTEM = `Bạn là chuyên gia dinh dưỡng thể thao, ước tính calo và macro cho bữa ăn của người Việt.

QUY TẮC:
- Người dùng đã nhập tên món và khối lượng (gram). Tính calo, protein, carb, fat CHO ĐÚNG khối lượng đó.
- Dùng giá trị tham chiếu thực tế (USDA / Bảng thành phần dinh dưỡng Việt Nam).
- Nguyên liệu thô/khô (gạo sống, thịt sống, yến mạch khô): dùng giá trị ở trạng thái đó. Món đã nấu (cơm, phở, thịt nướng): dùng giá trị đã nấu. Nếu tên món mơ hồ, chọn cách hiểu phổ biến nhất và ghi vào assumptions.
- Món hỗn hợp (bún bò, cơm tấm, bánh mì): ước tính theo công thức điển hình, nêu giả định chính (dầu, đường, phần thịt).
- calories phải xấp xỉ 4*proteinG + 4*carbsG + 9*fatG.
- Giữ đúng số món và đúng thứ tự người dùng nhập; không thêm/bớt món.
- Làm tròn calo tới 1 kcal, macro tới 0,1 g.
- Đây là ước lượng: dùng confidence low/medium/high và nêu caveats ngắn. Không đưa lời khuyên y tế.

Trả về CHỈ JSON:
{
  "items": [
    {"name":"...","calories":0,"proteinG":0,"carbsG":0,"fatG":0,"confidence":"low|medium|high"}
  ],
  "confidence": "low|medium|high",
  "assumptions": ["..."],
  "caveats": ["..."],
  "disclaimer": "..."
}`;

async function estimateFromItems({ mealType, items, description, user }) {
  const list = items
    .map((item, index) => `${index + 1}. ${item.name} — ${item.grams} g`)
    .join('\n');
  const context = `Bữa: ${mealType}. Mục tiêu: ${user.profile?.goal || 'maintain'}. Mô tả thêm: ${
    description || 'không có'
  }.\nCác món người dùng đã nhập (giữ đúng thứ tự):\n${list}`;

  let lastError;
  for (let attempt = 0; attempt <= 1; attempt += 1) {
    const response = await chatCompletion({
      messages: [
        { role: 'system', content: ESTIMATE_SYSTEM },
        {
          role: 'user',
          content: attempt
            ? `${context}\n\nLần trước lỗi: ${lastError.message}. Trả lời đúng JSON, đúng ${items.length} món.`
            : context,
        },
      ],
      json: true,
      maxTokens: 2500,
      temperature: 0.1,
      reasoningEffort: 'low',
    });
    try {
      const parsed = mealAnalysisSchema.parse(parseJsonLoose(response.text));
      if (parsed.items.length !== items.length) {
        throw new Error(`Cần đúng ${items.length} món, AI trả ${parsed.items.length} món`);
      }
      // Khối lượng do người dùng nhập là nguồn chuẩn, không để AI đổi.
      const analysis = {
        ...parsed,
        items: parsed.items.map((item, index) => {
          const grams = items[index].grams;
          const scale = 100 / grams;
          return {
            ...item,
            name: items[index].name,
            grams,
            portion: `${grams} g`,
            // Giữ giá trị /100 g để client tự scale khi người dùng sửa khối lượng.
            per100g: {
              calories: Math.round((Number(item.calories) || 0) * scale),
              proteinG: Math.round((Number(item.proteinG) || 0) * scale * 10) / 10,
              carbsG: Math.round((Number(item.carbsG) || 0) * scale * 10) / 10,
              fatG: Math.round((Number(item.fatG) || 0) * scale * 10) / 10,
            },
          };
        }),
      };
      return { analysis, usage: response.usage, model: response.model };
    } catch (error) {
      lastError = error;
    }
  }
  throw new ApiError(
    502,
    'AI_INVALID_OUTPUT',
    `AI trả về dữ liệu bữa ăn không hợp lệ: ${lastError.message}`,
  );
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

export async function estimate(req, res) {
  const data = mealEstimateSchema.parse(req.body || {});
  const user = await getUser(req.userId);

  await assertAiQuota(req.userId, 'vision');
  const result = await estimateFromItems({
    mealType: data.mealType,
    items: data.items,
    description: data.description,
    user,
  });
  await recordAiCall(req.userId, { kind: 'vision', usage: result.usage });

  res.json({
    data: {
      analysis: withTotals(result.analysis),
      model: result.model,
    },
  });
}

export async function createManual(req, res) {
  const data = manualMealSchema.parse(req.body || {});
  const analysis = manualAnalysis(data.items);
  if (data.source === 'ai') {
    analysis.confidence = data.confidence || 'medium';
    analysis.assumptions = data.assumptions?.length
      ? data.assumptions
      : ['Số liệu do AI ước tính từ tên món và khối lượng bạn nhập.'];
    analysis.caveats = ['Ước tính từ khẩu phần, có thể lệch do cách chế biến và nguyên liệu.'];
    analysis.disclaimer = 'Đây là ước lượng dinh dưỡng, không phải phép đo chính xác.';
  }
  const meal = await Meal.create({
    userId: req.userId,
    dateKey: data.dateKey || todayKeyVN(),
    mealType: data.mealType || 'lunch',
    description: data.description,
    notes: data.notes,
    source: data.source,
    analysis,
  });
  res.status(201).json({ data: { meal } });
}

function manualAnalysis(items) {
  return {
    items: items.map((item) => ({
      name: item.name,
      portion: item.portion || '',
      calories: item.calories || 0,
      proteinG: item.proteinG || 0,
      carbsG: item.carbsG || 0,
      fatG: item.fatG || 0,
      confidence: 'high',
    })),
    totals: sumFoods(items),
    confidence: 'high',
    assumptions: ['Số liệu do bạn tự nhập, không phải AI ước tính từ ảnh.'],
    caveats: [],
    disclaimer: '',
  };
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
  const meal = await Meal.findOne({ _id: req.params.id, userId: req.userId });
  if (!meal) throw ApiError.notFound('Không tìm thấy bữa ăn');

  const data = manualMealUpdateSchema.parse(req.body || {});
  if (data.mealType !== undefined) meal.mealType = data.mealType;
  if (data.description !== undefined) meal.description = data.description;
  if (data.notes !== undefined) meal.notes = data.notes;
  if (data.items !== undefined) {
    meal.source = 'manual';
    meal.analysis = manualAnalysis(data.items);
  }
  await meal.save();
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
  await sendImageFile(req, res, DIR, meal.image.filename);
}
