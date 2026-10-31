import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const profileSchema = new mongoose.Schema(
  {
    sex: { type: String, enum: ['male', 'female'] },
    birthDate: Date,
    heightCm: { type: Number, min: 100, max: 250 },
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
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    profile: { type: profileSchema, default: () => ({}) },
    refreshTokenHash: { type: String, select: false },
    refreshTokenExpiresAt: { type: Date, select: false },
  },
  { timestamps: true },
);

userSchema.methods.setPassword = async function setPassword(password) {
  this.passwordHash = await bcrypt.hash(password, 12);
};

userSchema.methods.checkPassword = function checkPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject({ virtuals: false });
  delete obj.passwordHash;
  delete obj.refreshTokenHash;
  delete obj.refreshTokenExpiresAt;
  delete obj.__v;
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
