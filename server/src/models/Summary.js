import mongoose from 'mongoose';

const summarySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    paperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper', required: true, index: true },
    inputType: {
      type: String,
      enum: ['url', 'pdf', 'doi', 'abstract', 'text'],
      required: true,
    },
    basedOn: { type: String, enum: ['fulltext', 'abstract_only'], default: 'abstract_only' },
    // JSON theo schema mục 6.4 của plan, validate bằng zod ở Giai đoạn 2
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    model: { type: String, default: '' },
    promptVersion: { type: String, default: 'v1' },
    cacheKey: { type: String, index: true },
    language: { type: String, default: 'vi' },
  },
  { timestamps: true },
);

summarySchema.index({ userId: 1, paperId: 1, cacheKey: 1 });

export const Summary = mongoose.model('Summary', summarySchema);
