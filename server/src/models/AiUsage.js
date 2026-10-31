import mongoose from 'mongoose';

// Đếm lượt gọi AI theo ngày để giới hạn chi phí (quota/người dùng/ngày)
const aiUsageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateKey: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    summarize: { type: Number, default: 0, min: 0 },
    ask: { type: Number, default: 0, min: 0 },
    search: { type: Number, default: 0, min: 0 },
    apply: { type: Number, default: 0, min: 0 },
    tokensIn: { type: Number, default: 0, min: 0 },
    tokensOut: { type: Number, default: 0, min: 0 },
    costUsd: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

aiUsageSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

export const AiUsage = mongoose.model('AiUsage', aiUsageSchema);
