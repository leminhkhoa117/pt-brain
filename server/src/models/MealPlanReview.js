import mongoose from 'mongoose';

const mealPlanReviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'MealPlan', required: true, index: true },
    weekIndex: { type: Number, required: true, min: 0 },
    weekStart: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    weekEnd: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    score: { type: Number, min: 0, max: 100, required: true },
    grade: { type: String, default: '' },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    model: { type: String, default: '' },
  },
  { timestamps: true },
);

mealPlanReviewSchema.index({ userId: 1, planId: 1, weekStart: -1 }, { unique: true });
mealPlanReviewSchema.index({ userId: 1, planId: 1, createdAt: -1 });

export const MealPlanReview = mongoose.model('MealPlanReview', mealPlanReviewSchema);
