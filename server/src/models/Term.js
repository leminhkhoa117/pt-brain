import mongoose from 'mongoose';

const termSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    en: { type: String, required: true, trim: true },
    vi: { type: String, required: true, trim: true },
    explanation: { type: String, default: '' },
    example: { type: String, default: '' },
    sourcePaperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

termSchema.index({ userId: 1, en: 1 }, { unique: true });

export const Term = mongoose.model('Term', termSchema);
