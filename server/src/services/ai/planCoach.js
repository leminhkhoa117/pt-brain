import { z } from 'zod';
import { chatCompletion, parseJsonLoose } from '../ai/client.js';
import { getEvidence, formatEvidence, evidenceReferences } from '../../research/evidenceBase.js';
import { computeProgramMetrics, gradeForScore } from '../training/programMetrics.js';
import { listExercises } from '../training/exerciseService.js';
import { suggestProgram } from '../training/programService.js';
import { ApiError } from '../../utils/ApiError.js';
import {
  HEALTH_CONDITION_MAP,
  healthConditionLabel,
  isExerciseAvoided,
} from '../../../../shared/health/conditions.js';

const EVIDENCE_IDS = ['E1', 'E2', 'E4', 'E5', 'E6', 'E8'];
const EVIDENCE_TEXT = formatEvidence(getEvidence(EVIDENCE_IDS));

const planSchema = z.object({
  name: z.string().default('Giáo án AI đề xuất'),
  split: z.enum(['full_body', 'upper_lower', 'ppl', 'custom']).default('custom'),
  days: z
    .array(
      z.object({
        name: z.string(),
        exercises: z
          .array(
            z.object({
              name: z.string(),
              sets: z.coerce.number().default(3),
              repMin: z.coerce.number().default(8),
              repMax: z.coerce.number().default(12),
              targetRir: z.coerce.number().default(2),
              restSec: z.coerce.number().default(120),
            }),
          )
          .default([]),
      }),
    )
    .default([]),
  rationale: z.string().default(''),
  evidenceIds: z.array(z.string()).default([]),
  cautions: z.array(z.string()).default([]),
});

const evaluationSchema = z.object({
  headline: z.string().default(''),
  summary: z.string().default(''),
  strengths: z.array(z.string()).default([]),
  issues: z
    .array(
      z.object({
        point: z.string(),
        severity: z.enum(['low', 'medium', 'high']).default('medium'),
        evidenceIds: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  recommendations: z
    .array(
      z.object({
        action: z.string(),
        priority: z.enum(['low', 'medium', 'high']).default('medium'),
        rationale: z.string().default(''),
        evidenceIds: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  caveats: z.array(z.string()).default([]),
});

function normalizeName(value = '') {
  return String(value).trim().toLowerCase();
}

function filterEvidenceIds(ids = []) {
  return Array.from(new Set((ids || []).filter((id) => EVIDENCE_IDS.includes(id))));
}

function planErrorText(error) {
  if (error?.issues) {
    return error.issues
      .slice(0, 3)
      .map((issue) => `${issue.path.join('.') || 'plan'}: ${issue.message}`)
      .join('; ');
  }
  return error?.message || 'AI không trả về giáo án hợp lệ';
}

function healthSection({ conditions = [], notes = '' } = {}) {
  const picked = (conditions || []).map((key) => HEALTH_CONDITION_MAP[key]).filter(Boolean);
  if (!picked.length && !notes) return '';
  return [
    'TÌNH TRẠNG SỨC KHỎE CỦA NGƯỜI DÙNG (bắt buộc cá nhân hóa, ưu tiên hơn quy tắc volume):',
    ...picked.map((item) => `- ${item.vi}: ${item.rules}`),
    ...(notes ? [`- Ghi chú thêm: ${notes}`] : []),
    '- Không chẩn đoán hay điều trị; không hứa hết đau. Nêu giới hạn và khuyên gặp bác sĩ/PT chuyên môn trước khi tập nặng.',
    '',
  ].join('\n');
}

function withSafetyCautions(cautions = [], { conditions = [], removed = [] } = {}) {
  const labels = (conditions || []).map(healthConditionLabel).join(', ');
  const list = [...(cautions || [])];
  if (removed.length) {
    list.push(
      `Đã loại ${removed.length} bài (${Array.from(new Set(removed)).join(', ')}) vì không phù hợp với ${labels}.`,
    );
  }
  if (conditions?.length) {
    list.push('Giáo án cần bác sĩ/PT chuyên môn duyệt lại trước khi áp dụng vì có bệnh nền.');
  }
  return Array.from(new Set(list)).slice(0, 8);
}

export async function generatePlanProposal({ profile = {}, params = {} }) {
  const exercises = await listExercises();
  // Chỉ đưa vào prompt bài tập khớp dụng cụ để giảm token và tránh gợi ý sai.
  const allowedEquipment = new Set([...(params.equipment || []), 'bodyweight']);
  const usable = params.equipment?.length
    ? exercises.filter((exercise) => (exercise.equipment || []).some((eq) => allowedEquipment.has(eq)))
    : exercises;
  const exerciseList = usable.map((e) => ({
    name: e.nameVi,
    muscles: e.primaryMuscles,
    equipment: e.equipment,
    compound: e.isCompound,
  }));

  const conditions =
    (profile.healthConditions?.length ? profile.healthConditions : params.healthConditions) || [];
  const conditionNotes = profile.conditionNotes || params.conditionNotes || '';
  const health = healthSection({ conditions, notes: conditionNotes });

  const prompt = `Bạn là huấn luyện viên lập giáo án dựa trên bằng chứng.
QUY TẮC:
- Chỉ chọn bài tập trong DANH SÁCH BÀI TẬP cho sẵn, dùng đúng tên.
- Volume mục tiêu 10-20 set/nhóm cơ/tuần; mỗi nhóm cơ chính 2 lần/tuần; compound ưu tiên đầu buổi.
- RIR 1-3; rest 90-180 giây cho compound, 60-90 giây cho isolation.
- Số ngày đúng yêu cầu; mỗi buổi tối đa 7 bài.
- Phân bổ cân bằng push/pull và upper/lower; có deloadEveryWeeks 4-8.
- Cá nhân hóa theo mục tiêu, trình độ, dụng cụ và thời gian.
- Chỉ dùng bằng chứng dưới đây, trích ID [E1]... trong evidenceIds.

${health}
${EVIDENCE_TEXT}

HỒ SƠ: ${JSON.stringify(profile)}
YÊU CẦU: ${JSON.stringify(params)}
DANH SÁCH BÀI TẬP: ${JSON.stringify(exerciseList)}

Trả CHỈ JSON:
{"name":"...","split":"full_body|upper_lower|ppl|custom","days":[{"name":"...","exercises":[{"name":"...","sets":3,"repMin":8,"repMax":12,"targetRir":2,"restSec":120}]}],"rationale":"...","evidenceIds":["E1"],"cautions":["..."]}`;

  try {
    const response = await chatCompletion({
      messages: [
        { role: 'system', content: 'Bạn là huấn luyện viên thể hình lập giáo án có căn cứ. Trả JSON hợp lệ.' },
        { role: 'user', content: prompt },
      ],
      json: true,
      maxTokens: 12000,
      temperature: 0.2,
      reasoningEffort: 'low',
      timeoutMs: 240000,
    });
    const parsed = planSchema.parse(parseJsonLoose(response.text));

    const byName = new Map(exercises.map((e) => [normalizeName(e.nameVi), e]));
    const removed = [];
    const days = parsed.days.slice(0, 7).map((day) => ({
      name: day.name.slice(0, 80),
      exercises: day.exercises
        .map((ex) => {
          const found = byName.get(normalizeName(ex.name));
          if (!found) return null;
          if (isExerciseAvoided(found.nameEn, found.nameVi, conditions)) {
            removed.push(found.nameVi);
            return null;
          }
          const repMin = Math.min(30, Math.max(1, Math.min(ex.repMin, ex.repMax)));
          const repMax = Math.min(30, Math.max(repMin, Math.max(ex.repMin, ex.repMax)));
          return {
            exerciseId: found._id,
            name: found.nameVi,
            muscleGroup: found.primaryMuscles[0],
            sets: Math.max(1, Math.min(20, ex.sets)),
            repRange: { min: repMin, max: repMax },
            targetRir: Math.max(0, Math.min(5, ex.targetRir)),
            restSec: Math.max(30, Math.min(300, ex.restSec)),
          };
        })
        .filter(Boolean)
        .slice(0, 7),
    }));

    const totalExercises = days.reduce((sum, day) => sum + day.exercises.length, 0);
    if (!days.length || totalExercises < 3) {
      throw new ApiError(502, 'AI_PLAN_EMPTY', 'AI không trả về đủ bài tập hợp lệ');
    }

    return {
      source: 'ai',
      name: parsed.name,
      split: parsed.split,
      daysPerWeek: days.length,
      days,
      rationale: parsed.rationale,
      cautions: withSafetyCautions(parsed.cautions, { conditions, removed }),
      evidence: evidenceReferences(filterEvidenceIds(parsed.evidenceIds)),
      model: response.model,
      usage: response.usage,
    };
  } catch (error) {
    // Fallback an toàn theo quy tắc nếu AI lỗi/không hợp lệ
    const fallback = await suggestProgram({
      goal: params.goal || 'maintain',
      experience: params.experience || 'intermediate',
      daysPerWeek: params.daysPerWeek || 3,
      equipment: params.equipment || [],
      sessionMinutes: params.sessionMinutes || 60,
      healthConditions: conditions,
    });
    return {
      source: 'fallback',
      name: params.name || fallback.splitLabel,
      split: fallback.split,
      daysPerWeek: fallback.daysPerWeek,
      days: fallback.days,
      rationale:
        'AI không trả về giáo án hợp lệ nên hệ thống dùng quy tắc nội bộ (volume 10-20 set, 2 lần/nhóm cơ, ưu tiên compound).',
      cautions: withSafetyCautions(
        [
          `AI plan không hợp lệ: ${planErrorText(error)}`,
          ...(fallback.missingSlots
            ? [
                `Một số slot bị bỏ trống vì không có bài phù hợp dụng cụ đã chọn (${fallback.missingSlots} slot).`,
              ]
            : []),
        ],
        { conditions },
      ),
      evidence: evidenceReferences(['E1', 'E2', 'E6']),
      model: 'rule-based',
      usage: null,
    };
  }
}

export async function evaluateProgram({ program, profile = {} }) {
  const exercises = await listExercises();
  const map = Object.fromEntries(exercises.map((e) => [e.nameVi, e]));
  const metrics = computeProgramMetrics(program.toObject ? program.toObject() : program, map);
  const conditions = profile.healthConditions || [];
  const health = healthSection({ conditions, notes: profile.conditionNotes || '' });

  const prompt = `Bạn là chuyên gia đánh giá giáo án tập luyện dựa trên bằng chứng.
Hãy đánh giá giáo án dưới đây, chỉ dùng các bằng chứng được cung cấp.
- Không tự bịa số liệu; dùng đúng metrics.
- Nêu điểm mạnh, vấn đề, đề xuất hành động cụ thể, ưu tiên.
- Nếu người dùng có bệnh nền, kiểm tra rõ bài nào chống chỉ định và đề xuất bài thay thế.
- Nếu đề xuất thay đổi, nêu rõ nên tăng/giảm set, tần suất, RIR, thời gian nghỉ.
- Trích dẫn bằng ID [E1]... trong evidenceIds; chỉ dùng ID có trong danh sách.

${health}
${EVIDENCE_TEXT}

HỒ SƠ: ${JSON.stringify(profile)}
GIÁO ÁN: ${JSON.stringify(program)}
METRICS: ${JSON.stringify(metrics)}

Trả CHỈ JSON:
{"headline":"...","summary":"...","strengths":["..."],"issues":[{"point":"...","severity":"low|medium|high","evidenceIds":["E1"]}],"recommendations":[{"action":"...","priority":"low|medium|high","rationale":"...","evidenceIds":["E2"]}],"caveats":["..."]}`;

  const response = await chatCompletion({
    messages: [
      { role: 'system', content: 'Bạn đánh giá giáo án thể hình dựa trên bằng chứng khoa học. Trả JSON hợp lệ.' },
      { role: 'user', content: prompt },
    ],
    json: true,
    maxTokens: 5000,
    temperature: 0.2,
    timeoutMs: 240000,
  });

  let ai;
  try {
    ai = evaluationSchema.parse(parseJsonLoose(response.text));
  } catch (error) {
    throw new ApiError(502, 'AI_INVALID_OUTPUT', `Đánh giá giáo án không hợp lệ: ${error.message}`);
  }

  const usedIds = filterEvidenceIds([
    ...ai.issues.flatMap((item) => item.evidenceIds || []),
    ...ai.recommendations.flatMap((item) => item.evidenceIds || []),
  ]);
  const score = metrics.score;
  return {
    score,
    grade: gradeForScore(score),
    headline: ai.headline,
    summary: ai.summary,
    strengths: ai.strengths,
    issues: ai.issues.map((item) => ({ ...item, evidenceIds: filterEvidenceIds(item.evidenceIds) })),
    recommendations: ai.recommendations.map((item) => ({
      ...item,
      evidenceIds: filterEvidenceIds(item.evidenceIds),
    })),
    caveats: ai.caveats,
    subscores: metrics.subscores,
    metrics,
    evidence: evidenceReferences(usedIds.length ? usedIds : EVIDENCE_IDS.slice(0, 4)),
    model: response.model,
    usage: response.usage,
  };
}
