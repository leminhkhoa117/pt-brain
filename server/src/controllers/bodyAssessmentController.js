import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { BodyAssessment } from '../models/BodyAssessment.js';
import { BodyLog } from '../models/BodyLog.js';
import { getUser } from '../services/authService.js';
import { assertAiQuota, recordAiCall } from '../services/ai/quota.js';
import { visionCompletion, parseJsonLoose } from '../services/ai/client.js';
import { bodyAssessmentSchema, bodyAssessmentFormSchema } from '../validation/vision.js';
import { EVIDENCE_BASE, formatEvidence, getEvidence, evidenceReferences } from '../research/evidenceBase.js';
import { ApiError } from '../utils/ApiError.js';
import { todayKeyVN } from '../utils/date.js';
import { saveImageFile, removeImageFile } from '../utils/image.js';

const DIR = fileURLToPath(new URL('../../uploads/assessments/', import.meta.url));
const VIEWS = ['front', 'side', 'back', 'detail'];

function buildSystemPrompt(goal) {
  return `Bạn là huấn luyện viên thể hình giàu kinh nghiệm, phân tích ảnh cơ thể để đưa ra phản hồi thực tế cho người tập. Bạn KHÔNG phải bác sĩ.

QUY TẮC:
- Chỉ mô tả điều quan sát được từ ảnh và số liệu được cung cấp. Không nhận diện danh tính, không đoán tuổi/giới ngoài hồ sơ.
- KHÔNG chẩn đoán bệnh, không nói về rối loạn ăn uống, không đưa lời khuyên y tế.
- KHÔNG đưa ra % mỡ cơ thể chính xác. Chỉ đưa KHOẢNG (rangeMin-rangeMax) kèm confidence low/medium/high và caveat.
- Nêu rõ ảnh hưởng của ánh sáng, tư thế, quần áo, góc chụp.
- Đánh giá phải gắn với mục tiêu hiện tại của người dùng (${goal}).
- Ưu tiên hành vi cụ thể: volume, tần suất, bài tập, dinh dưỡng, theo dõi tiến độ. Không hứa hẹn kết quả.
- Không bịa số đo không có trong ảnh/số liệu.

BẰNG CHỨNG THAM KHẢO (chỉ dùng để định hướng, không trích dẫn ngoài danh sách):
${formatEvidence(getEvidence(['E10', 'E6', 'E7']))}

Trả về CHỈ JSON đúng dạng:
{
  "overall": "nhận xét tổng quan 3-5 câu",
  "estimatedBodyFat": { "rangeMin": 0, "rangeMax": 0, "confidence": "low|medium|high", "caveat": "..." },
  "physique": { "summary": "...", "muscleBalance": ["..."] },
  "posture": [{ "observation": "...", "implication": "...", "confidence": "low|medium|high" }],
  "goalFit": { "assessment": "...", "gaps": ["..."] },
  "priorities": ["..."],
  "trainingAdjustments": ["..."],
  "nutritionAdjustments": ["..."],
  "progressTracking": ["..."],
  "limitations": ["..."],
  "disclaimer": "Chỉ là ước lượng từ ảnh, không thay thế đánh giá y tế."
}`;
}

async function analyzeImages({ user, goal, notes, images, metrics }) {
  const system = buildSystemPrompt(goal);
  let userText = `HỒ SƠ: giới tính ${user.profile?.sex || 'không rõ'}, tuổi ${
    user.age() || 'không rõ'
  }, chiều cao ${user.profile?.heightCm || 'không rõ'} cm, kinh nghiệm ${
    user.profile?.experience || 'không rõ'
  }.
MỤC TIÊU: ${goal}.
SỐ LIỆU GẦN NHẤT: ${JSON.stringify(metrics)}.
GHI CHÚ: ${notes || 'không có'}.
ẢNH: ${images.map((img) => img.view).join(', ')}.`;

  let lastError;
  for (let attempt = 0; attempt <= 1; attempt += 1) {
    const response = await visionCompletion({
      system,
      text: userText,
      images,
      maxTokens: 5000,
      sessionId: randomUUID(),
    });
    try {
      const parsed = bodyAssessmentSchema.parse(parseJsonLoose(response.text));
      return { analysis: parsed, usage: response.usage, model: response.model };
    } catch (error) {
      lastError = error;
      userText += `\n\nLần trước JSON lỗi: ${error.message}. Trả lại CHỈ JSON đúng schema, không thêm chữ.`;
    }
  }
  throw new ApiError(502, 'AI_INVALID_OUTPUT', `AI trả về đánh giá không hợp lệ: ${lastError.message}`);
}

export async function create(req, res) {
  const form = bodyAssessmentFormSchema.parse(req.body || {});
  const files = req.files || [];
  if (!files.length) throw ApiError.badRequest('Cần ít nhất 1 ảnh cơ thể');

  const user = await getUser(req.userId);
  const goal = form.goal || user.profile?.goal || 'maintain';
  const latest = await BodyLog.findOne({ userId: req.userId }).sort({ dateKey: -1 }).lean();
  const metrics = {
    weightKg: latest?.weightKg || null,
    heightCm: user.profile?.heightCm || null,
    bodyFatPct: latest?.computed?.bodyFatNavy ?? latest?.bodyFatPct ?? null,
  };

  let views = [];
  try {
    const parsed = form.views ? JSON.parse(form.views) : [];
    if (Array.isArray(parsed)) views = parsed.map((v) => String(v).slice(0, 20));
  } catch {
    views = [];
  }

  const images = [];
  const savedFilenames = [];
  try {
    for (const [index, file] of files.entries()) {
      const view = views[index] || VIEWS[index] || `view-${index + 1}`;
      const filename = await saveImageFile(
        file.buffer,
        DIR,
        `${req.userId}-${Date.now()}-${index}`,
      );
      savedFilenames.push(filename);
      images.push({ filename, view, buffer: file.buffer, mime: file.mimetype });
    }

    await assertAiQuota(req.userId, 'vision');
    const result = await analyzeImages({ user, goal, notes: form.notes, images, metrics });
    await recordAiCall(req.userId, { kind: 'vision', usage: result.usage });

    const assessment = await BodyAssessment.create({
      userId: req.userId,
      dateKey: todayKeyVN(),
      goal,
      notes: form.notes,
      images: images.map(({ filename, view }) => ({ filename, view })),
      metrics,
      analysis: result.analysis,
      model: result.model,
    });
    res.status(201).json({
      data: {
        assessment,
        evidence: evidenceReferences(['E10', 'E6', 'E7']),
      },
    });
  } catch (error) {
    await Promise.all(savedFilenames.map((filename) => removeImageFile(DIR, filename)));
    throw error;
  }
}

export async function list(req, res) {
  const assessments = await BodyAssessment.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();
  res.json({ data: { assessments } });
}

export async function getOne(req, res) {
  const assessment = await BodyAssessment.findOne({
    _id: req.params.id,
    userId: req.userId,
  }).lean();
  if (!assessment) throw ApiError.notFound('Không tìm thấy đánh giá');
  res.json({ data: { assessment } });
}

export async function servePhoto(req, res) {
  const assessment = await BodyAssessment.findOne({
    _id: req.params.id,
    userId: req.userId,
    'images.filename': req.params.filename,
  });
  if (!assessment) throw ApiError.notFound('Không tìm thấy ảnh');
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.sendFile(path.join(DIR, req.params.filename));
}

export async function remove(req, res) {
  const assessment = await BodyAssessment.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!assessment) throw ApiError.notFound('Không tìm thấy đánh giá');
  await Promise.all(assessment.images.map((image) => removeImageFile(DIR, image.filename)));
  res.json({ data: { ok: true } });
}

export function listEvidence(req, res) {
  res.json({
    data: {
      evidence: EVIDENCE_BASE.filter((item) => ['body_photo', 'prescription', 'fat_loss'].includes(item.topic)),
    },
  });
}
