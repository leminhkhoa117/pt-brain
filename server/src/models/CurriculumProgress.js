import mongoose from 'mongoose';

// Tiến độ học tập của user theo từng bài trong giáo trình PT.
const curriculumProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lessonSlug: { type: String, required: true, trim: true },
    status: { type: String, enum: ['reading', 'completed'], default: 'reading' },
    quizBest: { type: Number, default: 0, min: 0, max: 100 },
    quizAttempts: { type: Number, default: 0, min: 0 },
    lastQuizScore: { type: Number, default: 0, min: 0, max: 100 },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

curriculumProgressSchema.index({ userId: 1, lessonSlug: 1 }, { unique: true });

export const CurriculumProgress = mongoose.model(
  'CurriculumProgress',
  curriculumProgressSchema,
);
