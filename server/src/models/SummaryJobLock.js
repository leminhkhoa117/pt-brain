import mongoose from 'mongoose';

/**
 * Khóa ngắn hạn theo (userId, cacheKey) để hai request đồng thời cho cùng
 * một DOI/PDF không tạo 2 job tóm tắt và trừ 2 lượt quota.
 *
 * TTL index tự dọn khóa nếu process chết giữa chừng. TTL không thay thế
 * release tường minh: job bình thường luôn release trong finally.
 */
const summaryJobLockSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cacheKey: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

summaryJobLockSchema.index({ userId: 1, cacheKey: 1 }, { unique: true });
summaryJobLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SummaryJobLock = mongoose.model('SummaryJobLock', summaryJobLockSchema);
