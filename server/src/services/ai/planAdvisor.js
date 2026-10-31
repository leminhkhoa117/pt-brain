import { chatCompletion, parseJsonLoose } from './client.js';
import { planProposalSchema } from '../../validation/learning.js';
import { ApiError } from '../../utils/ApiError.js';

const FIELD_LIMITS = {
  sets: { min: 1, max: 20 },
  targetRir: { min: 0, max: 5 },
  repMin: { min: 1, max: 30 },
  repMax: { min: 1, max: 30 },
};

/**
 * AI đề xuất chỉnh giáo án dựa trên kết luận thực tế của bài nghiên cứu.
 * Chỉ trả về thay đổi cho bài/ngày có thật; server sẽ kiểm tra lại lần nữa.
 */
export async function proposePlanChanges({ content, program }) {
  const programPayload = (program.days || []).map((day) => ({
    dayName: day.name,
    exercises: (day.exercises || []).map((e) => ({
      name: e.name,
      muscleGroup: e.muscleGroup,
      sets: e.sets,
      repRange: e.repRange,
      targetRir: e.targetRir,
    })),
  }));

  const response = await chatCompletion({
    messages: [
      {
        role: 'system',
        content: `Bạn là huấn luyện viên đọc nghiên cứu và đề xuất chỉnh giáo án một cách thận trọng.
- Chỉ dùng kết luận trong bản tóm tắt được cung cấp. Không thêm kiến thức ngoài.
- Chỉ đề xuất thay đổi cho ngày/bài CÓ THẬT trong giáo án (đúng tên).
- Chỉ dùng 4 field: "sets", "targetRir", "repMin", "repMax".
- Giới hạn: sets 1-20, targetRir 0-5, repMin/repMax 1-30.
- Thay đổi nhỏ, bảo thủ (tối đa ±2 set, ±1 RIR, ±2 rep). Không thay đổi nếu bằng chứng yếu hoặc không liên quan.
- Tối đa 5 thay đổi. Nếu không nên đổi, trả changes rỗng và noChangeReason.
- Trả về CHỈ JSON:
{"rationale":"...","changes":[{"dayName":"...","exerciseName":"...","field":"sets","after":4,"reason":"..."}],"noChangeReason":""}`,
      },
      {
        role: 'user',
        content: `BẢN TÓM TẮT NGHIÊN CỨU:\n${JSON.stringify({
          tldr: content.tldr,
          practicalTakeaways: content.practicalTakeaways,
          whoItDoesNotApplyTo: content.whoItDoesNotApplyTo,
          evidenceLevel: content.evidenceLevel,
          limitations: content.limitations,
        })}\n\nGIÁO ÁN HIỆN TẠI:\n${JSON.stringify(programPayload)}`,
      },
    ],
    json: true,
    temperature: 0.1,
    maxTokens: 1500,
  });

  let parsed;
  try {
    parsed = planProposalSchema.parse(parseJsonLoose(response.text));
  } catch (error) {
    throw new ApiError(502, 'AI_INVALID_OUTPUT', `Đề xuất giáo án không hợp lệ: ${error.message}`);
  }

  const changes = [];
  const skipped = [];
  for (const change of parsed.changes) {
    const day = (program.days || []).find((d) => d.name === change.dayName);
    const exercise = day?.exercises?.find((e) => e.name === change.exerciseName);
    if (!day || !exercise) {
      skipped.push({ ...change, reason: 'Không tìm thấy ngày/bài trong giáo án' });
      continue;
    }
    const limit = FIELD_LIMITS[change.field];
    if (!limit || !Number.isFinite(change.after) || change.after < limit.min || change.after > limit.max) {
      skipped.push({ ...change, reason: 'Giá trị ngoài giới hạn cho phép' });
      continue;
    }

    const before =
      change.field === 'repMin'
        ? exercise.repRange?.min
        : change.field === 'repMax'
          ? exercise.repRange?.max
          : exercise[change.field];
    const after = Math.round(change.after);

    let nextRepMin = exercise.repRange?.min;
    let nextRepMax = exercise.repRange?.max;
    if (change.field === 'repMin') nextRepMin = after;
    if (change.field === 'repMax') nextRepMax = after;
    if (nextRepMin > nextRepMax) {
      skipped.push({ ...change, reason: 'repMin không được lớn hơn repMax' });
      continue;
    }
    if (before === after) {
      skipped.push({ ...change, reason: 'Không thay đổi' });
      continue;
    }

    changes.push({
      dayName: day.name,
      exerciseName: exercise.name,
      field: change.field,
      before,
      after,
      reason: change.reason,
    });
  }

  return {
    rationale: parsed.rationale,
    noChangeReason: parsed.noChangeReason,
    changes: changes.slice(0, 8),
    skipped,
    usage: response.usage,
    model: response.model,
  };
}
