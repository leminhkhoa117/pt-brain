import mongoose from 'mongoose';

/**
 * Sự kiện học tập nhẹ để đo vòng lặp Học → Áp dụng → Ôn tập.
 * Không chứa nội dung sức khỏe chi tiết; chỉ id bài/surface/action.
 * TTL 180 ngày để tránh phình DB.
 */
const learningEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['view', 'quiz', 'apply', 'dismiss', 'recommend_click', 'complete'],
      required: true,
    },
    lessonSlug: { type: String, default: '', trim: true, index: true },
    surface: { type: String, default: '', trim: true },
    contextKey: { type: String, default: '', trim: true, maxlength: 300 },
    metadata: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 180 },
  },
  { versionKey: false },
);

learningEventSchema.index({ userId: 1, type: 1, surface: 1, lessonSlug: 1, createdAt: -1 });
learningEventSchema.index({ userId: 1, createdAt: -1 });

export const LearningEvent = mongoose.model('LearningEvent', learningEventSchema);
