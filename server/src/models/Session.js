import mongoose from 'mongoose';

/**
 * Mỗi thiết bị/trình duyệt giữ một phiên riêng. Trước đây token refresh chỉ có
 * một chỗ trên User nên đăng nhập ở điện thoại sẽ đá văng phiên trên máy tính.
 */
const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    // Token vừa bị xoay vẫn hợp lệ thêm vài phút để 2 tab/PWA không đá nhau.
    prevTokenHash: { type: String },
    prevTokenExpiresAt: { type: Date },
    expiresAt: { type: Date, required: true },
    // false = cookie phiên (mất khi đóng trình duyệt); true = "ghi nhớ đăng nhập".
    remember: { type: Boolean, default: true },
    // Tăng khi đổi mật khẩu/đăng xuất khẩn cấp để access token cũ mất hiệu lực
    // ngay thay vì phải chờ hết TTL 15 phút.
    authVersion: { type: Number, default: 0, min: 0 },
    userAgent: { type: String, default: '', maxlength: 300 },
    ip: { type: String, default: '' },
    lastUsedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

sessionSchema.index({ userId: 1, expiresAt: 1 });

export const Session = mongoose.model('Session', sessionSchema);
