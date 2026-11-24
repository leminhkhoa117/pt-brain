import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { HEALTH_CONDITION_KEYS } from '../../../shared/health/conditions.js';

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_LOGINS = 5;
const LOGIN_LOCK_MINUTES = 15;

const profileSchema = new mongoose.Schema(
  {
    sex: { type: String, enum: ['male', 'female'] },
    birthDate: Date,
    heightCm: { type: Number, min: 100, max: 250 },
    weightKg: { type: Number, min: 20, max: 400 },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'very_active', 'extra_active'],
      default: 'moderate',
    },
    goal: {
      type: String,
      enum: ['cut', 'maintain', 'lean_bulk', 'bulk'],
      default: 'maintain',
    },
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    healthConditions: {
      type: [{ type: String, enum: HEALTH_CONDITION_KEYS }],
      default: [],
    },
    conditionNotes: { type: String, maxlength: 1000, default: '' },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    // Google-only account không có mật khẩu; đổi mật khẩu sẽ đặt mật khẩu đầu tiên.
    passwordHash: { type: String, select: false },
    // Cờ riêng để toSafeJSON biết tài khoản đã có mật khẩu hay chưa mà không
    // phải select passwordHash ở mọi query.
    hasPassword: { type: Boolean, default: false },
    googleId: { type: String, unique: true, sparse: true },
    googleLinked: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    avatarUrl: { type: String, maxlength: 500 },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    profile: { type: profileSchema, default: () => ({}) },
    // Chỉ tài khoản mới đăng ký mới bị đưa qua trang giới thiệu lần đầu.
    // Tài khoản cũ không có field này sẽ coi như false và vào thẳng dashboard.
    onboardingRequired: { type: Boolean, default: false },
    passwordChangedAt: { type: Date, select: false },
    // Chống dò mật khẩu theo tài khoản. Khi quá ngưỡng, tài khoản bị khóa tạm
    // 15 phút; thông báo trả về vẫn generic để không lộ email có tồn tại.
    failedLoginAttempts: { type: Number, default: 0, min: 0, select: false },
    lockedUntil: { type: Date, select: false },
    // Token đặt lại mật khẩu: chỉ lưu hash, dùng một lần, hết hạn 30 phút.
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    refreshTokenHash: { type: String, select: false },
    refreshTokenExpiresAt: { type: Date, select: false },
    // Token vừa bị xoay vẫn được chấp nhận thêm ít phút: PWA và tab trình duyệt
    // có thể refresh cùng lúc, không nên đá nhau gây đăng xuất oan.
    prevRefreshTokenHash: { type: String, select: false },
    prevRefreshTokenExpiresAt: { type: Date, select: false },
  },
  { timestamps: true },
);

userSchema.methods.setPassword = async function setPassword(password) {
  this.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  this.hasPassword = true;
  this.passwordChangedAt = new Date();
  this.failedLoginAttempts = 0;
  this.lockedUntil = undefined;
  this.passwordResetTokenHash = undefined;
  this.passwordResetExpiresAt = undefined;
};

userSchema.methods.checkPassword = function checkPassword(password) {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(password, this.passwordHash);
};

/** Ghi nhận một lần sai mật khẩu; khóa tạm sau MAX_FAILED_LOGINS lần. */
userSchema.methods.registerFailedLogin = async function registerFailedLogin() {
  const attempts = (this.failedLoginAttempts || 0) + 1;
  const locked = attempts >= MAX_FAILED_LOGINS;
  const update = locked
    ? { failedLoginAttempts: 0, lockedUntil: new Date(Date.now() + LOGIN_LOCK_MINUTES * 60 * 1000) }
    : { failedLoginAttempts: attempts };
  Object.assign(this, update);
  await User.updateOne({ _id: this._id }, { $set: update });
};

userSchema.methods.clearFailedLogins = async function clearFailedLogins() {
  if (!this.failedLoginAttempts && !this.lockedUntil) return;
  this.failedLoginAttempts = 0;
  this.lockedUntil = undefined;
  await User.updateOne(
    { _id: this._id },
    { $set: { failedLoginAttempts: 0 }, $unset: { lockedUntil: 1 } },
  );
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject({ virtuals: false });
  delete obj.passwordHash;
  delete obj.passwordResetTokenHash;
  delete obj.passwordResetExpiresAt;
  delete obj.refreshTokenHash;
  delete obj.refreshTokenExpiresAt;
  delete obj.prevRefreshTokenHash;
  delete obj.prevRefreshTokenExpiresAt;
  delete obj.googleId;
  delete obj.failedLoginAttempts;
  delete obj.lockedUntil;
  delete obj.__v;
  obj.hasPassword = Boolean(obj.hasPassword);
  obj.googleLinked = Boolean(obj.googleLinked);
  obj.emailVerified = Boolean(obj.emailVerified);
  return obj;
};

/** Tuổi hiện tại từ birthDate (dùng cho BMR/HR zones). */
userSchema.methods.age = function age() {
  if (!this.profile?.birthDate) return null;
  const now = new Date();
  const birth = new Date(this.profile.birthDate);
  let years = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - birth.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < birth.getUTCDate())) years -= 1;
  return years;
};

export const User = mongoose.model('User', userSchema);
