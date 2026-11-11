import { AiUsage } from '../../models/AiUsage.js';
import { env } from '../../config/env.js';
import { todayKeyVN } from '../../utils/date.js';
import { ApiError } from '../../utils/ApiError.js';

const KIND_LABELS = {
  summarize: 'tóm tắt',
  translate: 'dịch bài',
  ask: 'hỏi đáp',
  search: 'tìm kiếm',
  apply: 'AI plan',
  quiz: 'quiz',
  vision: 'phân tích ảnh',
  mealplan: 'plan ăn uống',
  muscle: 'hỏi về cơ bắp',
};

/**
 * Kiểm tra quota trước khi gọi AI (không tăng nếu request thất bại).
 * kind: 'summarize' | 'ask' | 'search' | 'apply' | 'quiz' | 'vision' | 'mealplan' | 'muscle'
 */
export async function assertAiQuota(userId, kind, limit = env.AI_DAILY_LIMIT_PER_USER) {
  const dateKey = todayKeyVN();
  const usage = await AiUsage.findOne({ userId, dateKey }).lean();
  const used = usage?.[kind] || 0;
  if (used >= limit) {
    throw new ApiError(
      429,
      'AI_QUOTA_EXCEEDED',
      `Bạn đã dùng ${used}/${limit} lượt ${KIND_LABELS[kind] || kind} hôm nay. Thử lại vào ngày mai.`,
    );
  }
  return { used, limit, dateKey };
}

export async function recordAiCall(userId, { kind, usage = {}, delta = 1 }) {
  const dateKey = todayKeyVN();
  await AiUsage.updateOne(
    { userId, dateKey },
    {
      $inc: {
        [kind]: delta,
        tokensIn: usage.input || 0,
        tokensOut: usage.output || 0,
        costUsd: usage.cost || 0,
      },
    },
    { upsert: true, setDefaultsOnInsert: true },
  );
}

export async function getAiUsage(userId) {
  const dateKey = todayKeyVN();
  const usage = await AiUsage.findOne({ userId, dateKey }).lean();
  return {
    dateKey,
    summarize: usage?.summarize || 0,
    translate: usage?.translate || 0,
    ask: usage?.ask || 0,
    search: usage?.search || 0,
    apply: usage?.apply || 0,
    quiz: usage?.quiz || 0,
    vision: usage?.vision || 0,
    mealplan: usage?.mealplan || 0,
    muscle: usage?.muscle || 0,
    limit: env.AI_DAILY_LIMIT_PER_USER,
    tokensIn: usage?.tokensIn || 0,
    tokensOut: usage?.tokensOut || 0,
    costUsd: usage?.costUsd || 0,
  };
}
