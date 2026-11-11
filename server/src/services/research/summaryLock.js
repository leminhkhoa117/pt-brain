import { SummaryJobLock } from '../../models/SummaryJobLock.js';

// Dài hơn ngưỡng job bị coi là stale (6 phút) một chút để retry không bị
// chặn bởi khóa của job vừa chết; TTL vẫn dọn nếu process crash.
export const SUMMARY_LOCK_TTL_MS = 7 * 60 * 1000;

// Đảm bảo unique index đã sẵn sàng trước lần acquire đầu tiên; nếu DB chưa
// kết nối, init() sẽ chờ connection thay vì cho phép hai upsert cùng lọt.
const modelReady = SummaryJobLock.init().catch(() => {});

/**
 * Thử lấy khóa. Trả false nếu đang có request khác giữ khóa còn hạn.
 * Dùng updateOne + upsert trên filter "chưa có hoặc đã hết hạn" để atomic:
 * - không có document -> insert
 * - document hết hạn -> update
 * - document còn hạn -> filter không khớp, upsert đụng unique index -> E11000
 */
export async function acquireSummaryLock(userId, cacheKey, ttlMs = SUMMARY_LOCK_TTL_MS) {
  if (!cacheKey) return false;
  await modelReady;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMs);
  try {
    const result = await SummaryJobLock.updateOne(
      { userId, cacheKey, expiresAt: { $lte: now } },
      { $set: { expiresAt } },
      { upsert: true },
    );
    return result.upsertedCount === 1 || result.modifiedCount === 1;
  } catch (error) {
    if (error?.code === 11000) return false;
    throw error;
  }
}

export async function releaseSummaryLock(userId, cacheKey) {
  if (!cacheKey) return;
  await SummaryJobLock.deleteOne({ userId, cacheKey }).catch(() => {});
}

export async function releaseSummaryLocks(locks = []) {
  const pairs = locks.filter((item) => item?.cacheKey);
  if (!pairs.length) return;
  await SummaryJobLock.deleteMany({
    $or: pairs.map(({ userId, cacheKey }) => ({ userId, cacheKey })),
  }).catch(() => {});
}

/** Chỉ dùng cho test/dev: xóa mọi khóa của một user. */
export async function clearSummaryLocksForUser(userId) {
  await SummaryJobLock.deleteMany({ userId }).catch(() => {});
}
