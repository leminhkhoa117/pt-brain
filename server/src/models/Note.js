import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    paperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper' },
    summaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Summary' },
    text: { type: String, required: true, maxlength: 10000 },
    tags: { type: [String], default: [] },
    appliedToProgramId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  },
  { timestamps: true },
);

noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, tags: 1 });

export const Note = mongoose.model('Note', noteSchema);
