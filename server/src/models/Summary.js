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
    // Nội dung nguồn để đọc đối chiếu và hỏi đáp.
    // Chỉ lưu fulltext khi là open access hoặc PDF do chính người dùng tải lên;
    // bài paywall chỉ lưu abstract (không lưu nguyên văn có bản quyền).
    sourceText: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    sourceKind: {
      type: String,
      enum: ['open_access_fulltext', 'user_pdf', 'user_text', 'web_fulltext', 'abstract'],
      default: 'abstract',
    },
    pdfHash: { type: String, default: '' },
    qa: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    model: { type: String, default: '' },
    promptVersion: { type: String, default: 'v1' },
    cacheKey: { type: String, index: true },
    language: { type: String, default: 'vi' },
  },
  { timestamps: true },
);

summarySchema.index({ userId: 1, paperId: 1, cacheKey: 1 });

export const Summary = mongoose.model('Summary', summarySchema);
