import mongoose from 'mongoose';

/**
 * Cache kết quả xác minh OA/full text theo DOI. TTL do `expiresAt` quyết định:
 * kết quả dương 7 ngày, kết quả âm 24 giờ, để bài mới lên OA vẫn được phát hiện.
 */
const oaVerificationSchema = new mongoose.Schema(
  {
    doi: { type: String, required: true, unique: true, index: true, lowercase: true },
    isOpenAccess: { type: Boolean, default: false },
    oaStatus: { type: String, default: '' },
    license: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
    fullTextUrl: { type: String, default: '' },
    pmcid: { type: String, default: '' },
    verifiedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
  },
  { timestamps: true },
);

// TTL index: Mongo tự xoá document khi hết hạn.
oaVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OaVerification = mongoose.model('OaVerification', oaVerificationSchema);
