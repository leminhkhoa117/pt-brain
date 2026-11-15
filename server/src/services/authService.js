import crypto from 'node:crypto';
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
import { Session } from '../models/Session.js';
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
// Cửa sổ ân hạn cho token vừa bị xoay (2 phút) để 2 tab/PWA cùng refresh không đá nhau.
const REFRESH_ROTATE_GRACE_MS = 2 * 60 * 1000;

function clientMeta({ userAgent = '', ip = '' } = {}) {
  return { userAgent: String(userAgent || '').slice(0, 300), ip: String(ip || '').slice(0, 80) };
}

/** Tạo phiên mới cho một thiết bị và trả cặp token gắn với session đó. */
async function createSessionTokens(user, meta = {}) {
  const session = await Session.create({
    userId: user._id,
    // Giá trị tạm để thoả unique index trước khi ký token cần session._id.
    tokenHash: `pending:${crypto.randomUUID()}`,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    ...clientMeta(meta),
  });
  const refreshToken = signRefreshToken(user._id, session._id);
  session.tokenHash = hashToken(refreshToken);
  await session.save();
  return { accessToken: signAccessToken(user._id, session._id), refreshToken, session };
}

/** Xoay token trong cùng một phiên, giữ nguyên session id của thiết bị. */
async function rotateSessionTokens(session, user) {
  const refreshToken = signRefreshToken(user._id, session._id);
  session.prevTokenHash = session.tokenHash;
  session.prevTokenExpiresAt = new Date(Date.now() + REFRESH_ROTATE_GRACE_MS);
  session.tokenHash = hashToken(refreshToken);
  session.expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
  session.lastUsedAt = new Date();
  await session.save();
  return { accessToken: signAccessToken(user._id, session._id), refreshToken };
}

export async function registerUser({ email, password, name }, meta = {}) {
  const normalizedEmail = email.toLowerCase().trim();
  const exists = await User.exists({ email: normalizedEmail });
  if (exists) throw ApiError.conflict('Email đã được đăng ký');

  const user = new User({
    email: normalizedEmail,
    name: name.trim(),
    onboardingRequired: true,
  });
  await user.setPassword(password);
  await user.save();
  const tokens = await createSessionTokens(user, meta);
  return { user, ...tokens };
}

export async function loginUser({ email, password }, meta = {}) {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    '+passwordHash +refreshTokenHash +refreshTokenExpiresAt +prevRefreshTokenHash +prevRefreshTokenExpiresAt',
  );
  if (!user) throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');
  const ok = await user.checkPassword(password);
  if (!ok) throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');
  const tokens = await createSessionTokens(user, meta);
  // Dọn phiên hết hạn của tài khoản cho gọn DB.
  await Session.deleteMany({ userId: user._id, expiresAt: { $lt: new Date() } });
  return { user, ...tokens };
}

export async function rotateSession(refreshToken, meta = {}) {
  if (!refreshToken) throw ApiError.unauthorized('Không có refresh token');
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Refresh token không hợp lệ hoặc đã hết hạn');
  }

  const now = new Date();
  const tokenHash = hashToken(refreshToken);

  // Token mới: gắn với session của đúng thiết bị.
  if (payload.sid) {
    const session = await Session.findOne({ _id: payload.sid, userId: payload.sub });
    if (!session) throw ApiError.unauthorized('Phiên đăng nhập không tồn tại');
    if (session.expiresAt <= now) {
      await session.deleteOne();
      throw ApiError.unauthorized('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    }
    const matchesCurrent = session.tokenHash === tokenHash;
    const inGraceWindow =
      session.prevTokenHash === tokenHash &&
      session.prevTokenExpiresAt &&
      session.prevTokenExpiresAt > now;
    if (!matchesCurrent && !inGraceWindow) {
      // Token cũ bị dùng lại sau cửa sổ ân hạn: chỉ thu hồi phiên này,
      // các thiết bị khác vẫn đăng nhập bình thường.
      await session.deleteOne();
      throw ApiError.unauthorized('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại');
    }
    const user = await User.findById(payload.sub);
    if (!user) throw ApiError.unauthorized('Tài khoản không tồn tại');
    const tokens = await rotateSessionTokens(session, user);
    return { user, ...tokens };
  }

  // Token kiểu cũ (phát hành trước khi có session): xác thực theo User rồi
  // nâng cấp sang session mới để các thiết bị không đá nhau nữa.
  const user = await User.findById(payload.sub).select(
    '+refreshTokenHash +refreshTokenExpiresAt +prevRefreshTokenHash +prevRefreshTokenExpiresAt',
  );
  if (!user) throw ApiError.unauthorized('Tài khoản không tồn tại');
  const matchesCurrent = user.refreshTokenHash === tokenHash;
  const inGraceWindow =
    user.prevRefreshTokenHash === tokenHash &&
    user.prevRefreshTokenExpiresAt &&
    user.prevRefreshTokenExpiresAt > now;
  const notExpired = user.refreshTokenExpiresAt && user.refreshTokenExpiresAt > now;
  if ((!matchesCurrent && !inGraceWindow) || !notExpired) {
    throw ApiError.unauthorized('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại');
  }
  const tokens = await createSessionTokens(user, meta);
  await User.updateOne(
    { _id: user._id },
    {
      $unset: {
        refreshTokenHash: 1,
        refreshTokenExpiresAt: 1,
        prevRefreshTokenHash: 1,
        prevRefreshTokenExpiresAt: 1,
      },
    },
  );
  return { user, ...tokens };
}

export async function logoutUser(sessionId, userId) {
  if (sessionId) {
    await Session.deleteOne({ _id: sessionId, userId });
    return;
  }
  // Access token phát hành trước khi có session id: thu hồi toàn bộ phiên cũ.
  if (!userId) return;
  await Session.deleteMany({ userId });
  await User.findByIdAndUpdate(userId, {
    $unset: {
      refreshTokenHash: 1,
      refreshTokenExpiresAt: 1,
      prevRefreshTokenHash: 1,
      prevRefreshTokenExpiresAt: 1,
    },
  });
}

export async function getUser(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.unauthorized('Tài khoản không tồn tại');
  return user;
}

/** Đánh dấu đã xem trang giới thiệu; các lần đăng nhập sau vào thẳng dashboard. */
export async function markIntroSeen(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { onboardingRequired: false } },
    { new: true },
  );
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
    Session.deleteMany(filter),
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
