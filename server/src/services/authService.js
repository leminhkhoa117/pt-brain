import { BodyAssessment } from '../models/BodyAssessment.js';
import { BodyLog } from '../models/BodyLog.js';
import { CalcHistory } from '../models/CalcHistory.js';
import { Flashcard } from '../models/Flashcard.js';
import { Meal } from '../models/Meal.js';
import { MealPlan } from '../models/MealPlan.js';
import { MealPlanReview } from '../models/MealPlanReview.js';
import { Note } from '../models/Note.js';
import { Paper } from '../models/Paper.js';
import { PlanEvaluation } from '../models/PlanEvaluation.js';
import { Program } from '../models/Program.js';
import { Summary } from '../models/Summary.js';
import { Term } from '../models/Term.js';
import { User } from '../models/User.js';
import { WorkoutSession } from '../models/WorkoutSession.js';
import { AiUsage } from '../models/AiUsage.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from './tokens.js';
import {
  ASSESSMENT_IMAGE_DIR,
  MEAL_IMAGE_DIR,
  PHOTO_DIR,
  removeImageFiles,
  removeOrphanPdfs,
} from './userFiles.js';

const REFRESH_TTL_MS = env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

async function issueTokens(user) {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  user.refreshTokenHash = hashToken(refreshToken);
  user.refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TTL_MS);
  await user.save();
  return { accessToken, refreshToken };
}

export async function registerUser({ email, password, name }) {
  const normalizedEmail = email.toLowerCase().trim();
  const exists = await User.exists({ email: normalizedEmail });
  if (exists) throw ApiError.conflict('Email đã được đăng ký');

  const user = new User({ email: normalizedEmail, name: name.trim() });
  await user.setPassword(password);
  await user.save();
  const tokens = await issueTokens(user);
  return { user, ...tokens };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    '+passwordHash +refreshTokenHash +refreshTokenExpiresAt',
  );
  if (!user) throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');
  const ok = await user.checkPassword(password);
  if (!ok) throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');
  const tokens = await issueTokens(user);
  return { user, ...tokens };
}

export async function rotateSession(refreshToken) {
  if (!refreshToken) throw ApiError.unauthorized('Không có refresh token');
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Refresh token không hợp lệ hoặc đã hết hạn');
  }
  const user = await User.findById(payload.sub).select('+refreshTokenHash +refreshTokenExpiresAt');
  if (!user) throw ApiError.unauthorized('Tài khoản không tồn tại');
  const matches = user.refreshTokenHash === hashToken(refreshToken);
  const notExpired = user.refreshTokenExpiresAt && user.refreshTokenExpiresAt > new Date();
  if (!matches || !notExpired) {
    // Token cũ bị dùng lại -> hủy phiên hiện tại
    user.refreshTokenHash = undefined;
    user.refreshTokenExpiresAt = undefined;
    await user.save();
    throw ApiError.unauthorized('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại');
  }
  const tokens = await issueTokens(user);
  return { user, ...tokens };
}

export async function logoutUser(userId) {
  if (!userId) return;
  await User.findByIdAndUpdate(userId, {
    $unset: { refreshTokenHash: 1, refreshTokenExpiresAt: 1 },
  });
}

export async function getUser(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.unauthorized('Tài khoản không tồn tại');
  return user;
}

const PROFILE_FIELDS = [
  'sex',
  'birthDate',
  'heightCm',
  'weightKg',
  'activityLevel',
  'goal',
  'experience',
  'units',
  'healthConditions',
  'conditionNotes',
];

export async function updateUser(userId, { name, profile }) {
  const user = await getUser(userId);
  if (name !== undefined) user.name = name.trim();
  if (profile) {
    for (const field of PROFILE_FIELDS) {
      if (profile[field] !== undefined) {
        if (field === 'birthDate') {
          user.profile.birthDate = profile.birthDate ? new Date(profile.birthDate) : undefined;
        } else {
          user.profile[field] = profile[field];
        }
      }
    }
  }
  await user.save();
  return user;
}

/**
 * Xóa tài khoản và toàn bộ dữ liệu liên quan (yêu cầu riêng tư của plan).
 * Ảnh/PDF nằm ngoài MongoDB nên phải thu thập trước khi xóa document, sau đó
 * mới xóa file. PDF dedupe theo hash nên chỉ xóa khi không còn ai tham chiếu.
 */
export async function deleteAccount(userId) {
  const filter = { userId };
  const [logs, meals, assessments, summaries] = await Promise.all([
    BodyLog.find(filter).select('photos.filename').lean(),
    Meal.find(filter).select('image.filename').lean(),
    BodyAssessment.find(filter).select('images.filename').lean(),
    Summary.find(filter).select('pdfHash').lean(),
  ]);

  await Promise.all([
    BodyLog.deleteMany(filter),
    CalcHistory.deleteMany(filter),
    Program.deleteMany(filter),
    WorkoutSession.deleteMany(filter),
    Paper.deleteMany(filter),
    Summary.deleteMany(filter),
    Term.deleteMany(filter),
    Flashcard.deleteMany(filter),
    Note.deleteMany(filter),
    BodyAssessment.deleteMany(filter),
    Meal.deleteMany(filter),
    MealPlan.deleteMany(filter),
    MealPlanReview.deleteMany(filter),
    PlanEvaluation.deleteMany(filter),
    AiUsage.deleteMany(filter),
  ]);

  await Promise.all([
    removeImageFiles(
      PHOTO_DIR,
      logs.flatMap((log) => (log.photos || []).map((photo) => photo.filename)),
    ),
    removeImageFiles(
      MEAL_IMAGE_DIR,
      meals.map((meal) => meal.image?.filename),
    ),
    removeImageFiles(
      ASSESSMENT_IMAGE_DIR,
      assessments.flatMap((assessment) => (assessment.images || []).map((image) => image.filename)),
    ),
    removeOrphanPdfs(summaries.map((summary) => summary.pdfHash)),
  ]);

  await User.findByIdAndDelete(userId);
}
