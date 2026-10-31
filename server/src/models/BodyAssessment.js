import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  { filename: String, view: String },
  { _id: false },
);

const bodyAssessmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dateKey: { type: String, required: true },
    goal: { type: String, enum: ['cut', 'maintain', 'lean_bulk', 'bulk'], default: 'maintain' },
    notes: { type: String, default: '', maxlength: 2000 },
    images: { type: [imageSchema], default: [] },
    metrics: { type: mongoose.Schema.Types.Mixed, default: {} },
    analysis: { type: mongoose.Schema.Types.Mixed, required: true },
    model: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

bodyAssessmentSchema.index({ userId: 1, dateKey: -1 });

export const BodyAssessment = mongoose.model('BodyAssessment', bodyAssessmentSchema);
