import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { BodyAssessment } from '../models/BodyAssessment.js';
import { BodyLog } from '../models/BodyLog.js';
import { CalcHistory } from '../models/CalcHistory.js';
import { CurriculumProgress } from '../models/CurriculumProgress.js';
import { LearningEvent } from '../models/LearningEvent.js';
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
import {
  hashToken,
  publicAppUrl,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from './tokens.js';
import { sendPasswordResetEmail } from './mailer.js';
import { passwordProblems } from '../../../shared/security/password.js';
import {
  ASSESSMENT_IMAGE_DIR,
  MEAL_IMAGE_DIR,
  PHOTO_DIR,
  removeImageFiles,
  removeOrphanPdfs,
} from './userFiles.js';

const REFRESH_TTL_MS = env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
const SESSION_TTL_MS = env.SESSION_REFRESH_TTL_HOURS * 60 * 60 * 1000;
// Cửa sổ ân hạn cho token vừa bị xoay (2 phút) để 2 tab/PWA cùng refresh không đá nhau.
const REFRESH_ROTATE_GRACE_MS = 2 * 60 * 1000;
const GENERIC_LOGIN_ERROR = 'Email hoặc mật khẩu không đúng';
// Hash giả để bcrypt vẫn tốn thời gian khi email không tồn tại — tránh lộ
// tài khoản qua thời gian phản hồi.
const DUMMY_PASSWORD_HASH = '$2a$12$kUkhHTDu4lZAT4jRVCnvseGH/fbXKnx63hksA08Th8CMPbYvUS5v2';

function clientMeta({ userAgent = '', ip = '' } = {}) {
  return { userAgent: String(userAgent || '').slice(0, 300), ip: String(ip || '').slice(0, 80) };
}

function assertPasswordPolicy(password, context = {}) {
  const problems = passwordProblems(password, context);
  if (problems.length) throw ApiError.badRequest(problems[0]);
}

async function burnPasswordCheck(password) {
  await bcrypt.compare(String(password || ''), DUMMY_PASSWORD_HASH);
}

/** Tạo phiên mới cho một thiết bị và trả cặp token gắn với session đó. */
async function createSessionTokens(user, meta = {}, { remember = true } = {}) {
  const session = await Session.create({
    userId: user._id,
    // Giá trị tạm để thoả unique index trước khi ký token cần session._id.
    tokenHash: `pending:${crypto.randomUUID()}`,
    expiresAt: new Date(Date.now() + (remember ? REFRESH_TTL_MS : SESSION_TTL_MS)),
    remember: Boolean(remember),
    authVersion: 0,
    ...clientMeta(meta),
  });
  const refreshToken = signRefreshToken(user._id, session._id);
  session.tokenHash = hashToken(refreshToken);
  await session.save();
  return {
    accessToken: signAccessToken(user._id, session._id, session.authVersion),
    refreshToken,
    remember: Boolean(remember),
    session,
  };
}

/** Xoay token trong cùng một phiên, giữ nguyên session id và chế độ ghi nhớ. */
async function rotateSessionTokens(session, user, meta = {}) {
  const remember = session.remember !== false;
  const refreshToken = signRefreshToken(user._id, session._id);
  session.prevTokenHash = session.tokenHash;
  session.prevTokenExpiresAt = new Date(Date.now() + REFRESH_ROTATE_GRACE_MS);
  session.tokenHash = hashToken(refreshToken);
  session.expiresAt = new Date(Date.now() + (remember ? REFRESH_TTL_MS : SESSION_TTL_MS));
  session.lastUsedAt = new Date();
  if (meta.ip) session.ip = String(meta.ip).slice(0, 80);
  await session.save();
  return {
    accessToken: signAccessToken(user._id, session._id, session.authVersion),
    refreshToken,
    remember,
  };
}

export async function registerUser({ email, password, name, remember = true }, meta = {}) {
  const normalizedEmail = email.toLowerCase().trim();
  assertPasswordPolicy(password, { email: normalizedEmail, name });
  const exists = await User.exists({ email: normalizedEmail });
  if (exists) throw ApiError.conflict('Email đã được đăng ký');

  const user = new User({
    email: normalizedEmail,
    name: name.trim(),
    onboardingRequired: true,
  });
  await user.setPassword(password);
  await user.save();
  const tokens = await createSessionTokens(user, meta, { remember });
  return { user, ...tokens };
}

export async function loginUser({ email, password, remember = true }, meta = {}) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select(
    '+passwordHash +hasPassword +failedLoginAttempts +lockedUntil',
  );

  if (!user) {
    await burnPasswordCheck(password);
    throw ApiError.unauthorized(GENERIC_LOGIN_ERROR);
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await burnPasswordCheck(password);
    throw ApiError.unauthorized(GENERIC_LOGIN_ERROR);
  }

  // Tài khoản tạo bằng Google chưa đặt mật khẩu: không cho đoán mật khẩu,
  // nhưng vẫn trả cùng một thông báo để không lộ phương thức đăng nhập.
  const hasPassword = Boolean(user.hasPassword || user.passwordHash);
  const ok = hasPassword ? await user.checkPassword(password) : false;
  if (!ok) {
    await burnPasswordCheck(password);
    await user.registerFailedLogin();
    throw ApiError.unauthorized(GENERIC_LOGIN_ERROR);
  }

  if (!user.hasPassword) {
    // Tài khoản cũ tạo trước khi có cột hasPassword.
    user.hasPassword = true;
    await User.updateOne({ _id: user._id }, { $set: { hasPassword: true } });
  }

  await user.clearFailedLogins();
  const tokens = await createSessionTokens(user, meta, { remember });
  // Dọn phiên hết hạn của tài khoản cho gọn DB.
  await Session.deleteMany({ userId: user._id, expiresAt: { $lt: new Date() } });
  return { user, ...tokens };
}

/**
 * Đăng nhập bằng Google. Chỉ liên kết theo email khi Google đã xác minh email
 * (exchangeGoogleCode đảm bảo điều này). Tài khoản mật khẩu hiện có vẫn giữ
 * nguyên mật khẩu và có thêm phương thức Google.
 */
export async function loginWithGoogle(profile, meta = {}) {
  let user = await User.findOne({ googleId: profile.sub });

  if (!user) {
    user = await User.findOne({ email: profile.email });
  }

  if (user) {
    if (user.googleId && user.googleId !== profile.sub) {
      throw ApiError.conflict('Email này đã liên kết với một tài khoản Google khác');
    }
    let changed = false;
    if (!user.googleId) {
      user.googleId = profile.sub;
      user.googleLinked = true;
      changed = true;
    }
    if (profile.picture && user.avatarUrl !== profile.picture) {
      user.avatarUrl = profile.picture;
      changed = true;
    }
    if (!user.emailVerified) {
      user.emailVerified = true;
      changed = true;
    }
    if (changed) await user.save();
  } else {
    try {
      user = await User.create({
        email: profile.email,
        name: profile.name,
        googleId: profile.sub,
        googleLinked: true,
        emailVerified: true,
        avatarUrl: profile.picture || undefined,
        hasPassword: false,
        onboardingRequired: true,
      });
    } catch (error) {
      // Hai tab callback cùng lúc: một request đã tạo user, đọc lại thay vì 500.
      if (error?.code !== 11000) throw error;
      user = await User.findOne({ googleId: profile.sub });
      if (!user) throw error;
    }
  }

  const tokens = await createSessionTokens(user, meta, { remember: meta.remember !== false });
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
    const tokens = await rotateSessionTokens(session, user, meta);
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
  const tokens = await createSessionTokens(user, meta, { remember: true });
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
 * Đổi mật khẩu (hoặc đặt mật khẩu lần đầu cho tài khoản Google).
 * Các phiên khác bị thu hồi ngay; phiên hiện tại được cấp lại token với
 * authVersion mới nên access token cũ mất hiệu lực tức thì.
 */
export async function changePassword(userId, sessionId, { currentPassword, newPassword }) {
  const user = await User.findById(userId).select('+passwordHash +hasPassword');
  if (!user) throw ApiError.unauthorized('Tài khoản không tồn tại');

  const hasPassword = Boolean(user.hasPassword || user.passwordHash);
  if (hasPassword) {
    if (!currentPassword) throw ApiError.badRequest('Vui lòng nhập mật khẩu hiện tại');
    const ok = await user.checkPassword(currentPassword);
    if (!ok) throw ApiError.badRequest('Mật khẩu hiện tại không đúng');
    if (currentPassword === newPassword) {
      throw ApiError.badRequest('Mật khẩu mới phải khác mật khẩu hiện tại');
    }
  }
  assertPasswordPolicy(newPassword, { email: user.email, name: user.name });

  await user.setPassword(newPassword);
  await user.save();

  await Session.deleteMany({ userId, ...(sessionId ? { _id: { $ne: sessionId } } : {}) });

  let tokens;
  if (sessionId) {
    const session = await Session.findOneAndUpdate(
      { _id: sessionId, userId },
      { $inc: { authVersion: 1 }, $set: { lastUsedAt: new Date() } },
      { new: true },
    );
    if (session) {
      const refreshToken = signRefreshToken(user._id, session._id);
      session.prevTokenHash = undefined;
      session.prevTokenExpiresAt = undefined;
      session.tokenHash = hashToken(refreshToken);
      session.expiresAt = new Date(
        Date.now() + (session.remember !== false ? REFRESH_TTL_MS : SESSION_TTL_MS),
      );
      await session.save();
      tokens = {
        accessToken: signAccessToken(user._id, session._id, session.authVersion),
        refreshToken,
        remember: session.remember !== false,
      };
    }
  }
  if (!tokens) tokens = await createSessionTokens(user, {}, { remember: true });

  return { user, ...tokens, sessionsRevoked: true };
}

export async function requestPasswordReset(email) {
  const normalizedEmail = String(email || '').toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return { requested: true };

  const token = crypto.randomBytes(32).toString('base64url');
  user.passwordResetTokenHash = hashToken(token);
  user.passwordResetExpiresAt = new Date(Date.now() + env.PASSWORD_RESET_TTL_MINUTES * 60 * 1000);
  await user.save();

  const resetUrl = `${publicAppUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });

  // Chỉ trả link trực tiếp khi dev/test và chưa cấu hình email — để dev UI
  // vẫn dùng được mà production không bao giờ lộ token.
  const exposeDevLink = env.NODE_ENV !== 'production' && !env.RESEND_API_KEY;
  return { requested: true, ...(exposeDevLink ? { devResetUrl: resetUrl } : {}) };
}

export async function resetPassword(token, newPassword) {
  const hash = hashToken(String(token || ''));
  const user = await User.findOne({
    passwordResetTokenHash: hash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select('+passwordHash +passwordResetTokenHash +passwordResetExpiresAt');

  if (!user) {
    throw ApiError.badRequest('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
  }

  assertPasswordPolicy(newPassword, { email: user.email, name: user.name });
  await user.setPassword(newPassword);
  await user.save();
  // Đặt lại mật khẩu là sự kiện bảo mật: đăng xuất mọi thiết bị.
  await Session.deleteMany({ userId: user._id });
  return user;
}

function deviceLabel(userAgent = '') {
  const ua = String(userAgent);
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\//.test(ua)
      ? 'Opera'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Trình duyệt';
  const os = /Android/i.test(ua)
    ? 'Android'
    : /iPhone|iPad|iPod/i.test(ua)
      ? 'iOS'
      : /Windows/i.test(ua)
        ? 'Windows'
        : /Mac OS X/i.test(ua)
          ? 'macOS'
          : /Linux/i.test(ua)
            ? 'Linux'
            : '';
  return [browser, os].filter(Boolean).join(' · ');
}

export async function listSessions(userId, currentSessionId) {
  const sessions = await Session.find({ userId }).sort({ lastUsedAt: -1, createdAt: -1 }).lean();
  return sessions.map((session) => ({
    id: String(session._id),
    current: String(session._id) === String(currentSessionId || ''),
    device: deviceLabel(session.userAgent),
    userAgent: session.userAgent || '',
    ip: session.ip || '',
    remember: session.remember !== false,
    createdAt: session.createdAt,
    lastUsedAt: session.lastUsedAt,
    expiresAt: session.expiresAt,
  }));
}

export async function revokeSession(userId, sessionId) {
  const result = await Session.deleteOne({ _id: sessionId, userId });
  return { revoked: result.deletedCount > 0 };
}

export async function revokeOtherSessions(userId, currentSessionId) {
  const result = await Session.deleteMany({
    userId,
    ...(currentSessionId ? { _id: { $ne: currentSessionId } } : {}),
  });
  return { revoked: result.deletedCount };
}

/**
 * Xóa tài khoản và toàn bộ dữ liệu liên quan (yêu cầu riêng tư của plan).
 * Ảnh/PDF nằm ngoài MongoDB nên phải thu thập trước khi xóa document, sau đó
 * mới xóa file. PDF dedupe theo hash nên chỉ xóa khi không còn ai tham chiếu.
 */
export async function deleteAccount(userId, password) {
  const user = await User.findById(userId).select('+passwordHash +hasPassword');
  if (!user) throw ApiError.unauthorized('Tài khoản không tồn tại');
  const hasPassword = Boolean(user.hasPassword || user.passwordHash);
  if (hasPassword) {
    if (!password) throw ApiError.badRequest('Nhập mật khẩu để xác nhận xóa tài khoản');
    const ok = await user.checkPassword(password);
    if (!ok) throw ApiError.badRequest('Mật khẩu xác nhận không đúng');
  }

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
    CurriculumProgress.deleteMany(filter),
    LearningEvent.deleteMany(filter),
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
