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
    // Dữ kiện thuần bước 1 (có trang + trích nguyên văn) để audit/đối chiếu.
    facts: { type: mongoose.Schema.Types.Mixed },
    status: {
      type: String,
      enum: ['processing', 'ready', 'failed'],
      default: 'ready',
      index: true,
    },
    progress: { type: String, default: '' },
    error: { type: String, default: '' },
    // Bản chưa qua kiểm tra tự động: vẫn lưu để đọc/đối chiếu, nhưng không cho áp dụng vào giáo án.
    needsReview: { type: Boolean, default: false },
    // Người dùng xác nhận đã đối chiếu PDF gốc; mở khoá áp dụng.
    reviewedAt: { type: Date },
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
    pdfPages: { type: Number, default: 0 },
    // Nhãn + chú thích hình/bảng phát hiện từ nguồn, dùng để gắn số trang cho phần giải thích.
    figureHints: {
      type: [
        {
          label: { type: String, default: '' },
          kind: { type: String, enum: ['figure', 'table'], default: 'figure' },
          page: { type: Number, default: 0 },
          caption: { type: String, default: '' },
        },
      ],
      default: [],
    },
    // Bản dịch tiếng Việt của toàn văn/abstract, tạo theo yêu cầu và lưu lại để không dịch lại.
    translation: {
      text: { type: String, default: '' },
      model: { type: String, default: '' },
      chars: { type: Number, default: 0 },
      truncated: { type: Boolean, default: false },
      createdAt: { type: Date },
    },
    tags: { type: [String], default: [] },
    isFavorite: { type: Boolean, default: false },
    savedAt: { type: Date, default: Date.now },
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
