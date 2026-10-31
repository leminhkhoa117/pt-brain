import mongoose from 'mongoose';

const planEvaluationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true, index: true },
    score: { type: Number, min: 0, max: 100, required: true },
    grade: { type: String, default: '' },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    model: { type: String, default: '' },
  },
  { timestamps: true },
);

planEvaluationSchema.index({ userId: 1, programId: 1, createdAt: -1 });

export const PlanEvaluation = mongoose.model('PlanEvaluation', planEvaluationSchema);
