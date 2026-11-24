import mongoose from 'mongoose';

const appliedActionSchema = new mongoose.Schema(
  {
    actionType: { type: String, required: true, trim: true },
    surface: { type: String, default: '', trim: true },
    label: { type: String, default: '', trim: true, maxlength: 200 },
    at: { type: Date, default: Date.now },
    payload: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false },
);

// Tiến độ học tập của user theo từng bài trong giáo trình PT.
const curriculumProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lessonSlug: { type: String, required: true, trim: true },
    status: { type: String, enum: ['reading', 'completed'], default: 'reading' },
    quizBest: { type: Number, default: 0, min: 0, max: 100 },
    quizAttempts: { type: Number, default: 0, min: 0 },
    lastQuizScore: { type: Number, default: 0, min: 0, max: 100 },
    lastViewedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    // 0–100: 60% điểm quiz tốt nhất + tối đa 40 điểm từ hành động áp dụng.
    mastery: { type: Number, default: 0, min: 0, max: 100 },
    appliedActions: { type: [appliedActionSchema], default: [] },
  },
  { timestamps: true },
);

curriculumProgressSchema.index({ userId: 1, lessonSlug: 1 }, { unique: true });
curriculumProgressSchema.index({ userId: 1, lastViewedAt: -1 });

export const CurriculumProgress = mongoose.model(
  'CurriculumProgress',
  curriculumProgressSchema,
);
