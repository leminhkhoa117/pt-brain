import { AiUsage } from '../../models/AiUsage.js';
import { env } from '../../config/env.js';
import { todayKeyVN } from '../../utils/date.js';
import { ApiError } from '../../utils/ApiError.js';

/**
 * Kiểm tra quota trước khi gọi AI (không tăng nếu request thất bại).
 * kind: 'summarize' | 'ask'
 */
export async function assertAiQuota(userId, kind, limit = env.AI_DAILY_LIMIT_PER_USER) {
  const dateKey = todayKeyVN();
  const usage = await AiUsage.findOne({ userId, dateKey }).lean();
  const used = usage?.[kind] || 0;
  if (used >= limit) {
    throw new ApiError(
      429,
      'AI_QUOTA_EXCEEDED',
      `Bạn đã dùng ${used}/${limit} lượt ${kind === 'ask' ? 'hỏi đáp' : 'tóm tắt'} hôm nay. Thử lại vào ngày mai.`,
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
    ask: usage?.ask || 0,
    search: usage?.search || 0,
    apply: usage?.apply || 0,
    quiz: usage?.quiz || 0,
    vision: usage?.vision || 0,
    limit: env.AI_DAILY_LIMIT_PER_USER,
    tokensIn: usage?.tokensIn || 0,
    tokensOut: usage?.tokensOut || 0,
    costUsd: usage?.costUsd || 0,
  };
}
