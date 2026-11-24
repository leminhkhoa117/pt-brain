import { CurriculumProgress } from '../../models/CurriculumProgress.js';
import { LearningEvent } from '../../models/LearningEvent.js';
import { LESSONS } from '../../../../shared/curriculum/lessons/index.js';
import {
  anatomyLessonsForGroup,
  lessonLearningMeta,
  LEARNING_SURFACES,
} from '../../../../shared/learning/contexts.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const REVIEW_DAYS = 7;
const EVENT_RETENTION_DAYS = 30;

const byOrder = new Map(LESSONS.map((lesson, index) => [lesson.slug, index]));

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === undefined || value === null || value === '') return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function intersects(left, right) {
  if (!Array.isArray(left) || !left.length) return true;
  const set = new Set(asArray(right));
  return left.some((item) => set.has(item));
}

function normalizeContext(input = {}) {
  return {
    goal: input.goal || '',
    experience: input.experience || '',
    conditions: asArray(input.conditions),
    muscles: asArray(input.muscles),
    exercises: asArray(input.exercises),
    calculators: asArray(input.calculator || input.calculators),
    groups: asArray(input.anatomyGroup || input.groups),
    region: input.region || '',
    query: String(input.query || '').trim().toLowerCase(),
  };
}

function lessonText(lesson) {
  return [
    lesson.title,
    lesson.subtitle,
    ...(lesson.objectives || []),
    ...(lesson.terms || []).map((term) => `${term.en} ${term.vi} ${term.def}`),
  ]
    .join(' ')
    .toLowerCase();
}

function contextScore(lesson, meta, surface, ctx) {
  let score = 0;
  const reasons = [];

  for (const context of meta.contexts) {
    if (context.surface !== surface) continue;
    if (!intersects(context.match?.goals, [ctx.goal])) continue;
    if (context.match?.goals?.length && !ctx.goal) continue;
    if (!intersects(context.match?.experience, [ctx.experience])) continue;
    if (!intersects(context.match?.conditions, ctx.conditions)) continue;
    if (!intersects(context.match?.muscles, ctx.muscles)) continue;
    if (!intersects(context.match?.exercises, ctx.exercises)) continue;
    if (!intersects(context.match?.calculators, ctx.calculators)) continue;
    if (!intersects(context.match?.groups, ctx.groups)) continue;

    score += 10 * (context.weight || 1);
    if (context.match?.conditions?.length && intersects(context.match.conditions, ctx.conditions)) {
      reasons.push('Phù hợp với bệnh nền / chấn thương trong hồ sơ');
    }
    if (context.match?.muscles?.length && intersects(context.match.muscles, ctx.muscles)) {
      reasons.push('Liên quan trực tiếp tới cơ đang chọn');
    }
    if (context.match?.exercises?.length && intersects(context.match.exercises, ctx.exercises)) {
      reasons.push('Liên quan tới bài tập đang log');
    }
    if (context.match?.calculators?.length && intersects(context.match.calculators, ctx.calculators)) {
      reasons.push('Giải thích chỉ số bạn đang xem');
    }
  }

  if (surface === 'muscle.atlas' && ctx.groups.length) {
    const groupLessons = anatomyLessonsForGroup(ctx.groups[0]);
    if (groupLessons.includes(lesson.slug)) {
      score += 14;
      reasons.push('Bài nền tảng cho vùng giải phẫu đang chọn');
    }
  }

  if (surface === 'research.reader' && ctx.query) {
    const words = ctx.query
      .split(/\s+/)
      .filter((word) => word.length >= 4)
      .slice(0, 8);
    const text = lessonText(lesson);
    const hits = words.filter((word) => text.includes(word)).length;
    if (hits) {
      const titleHits = words.filter((word) =>
        String(lesson.title || '').toLowerCase().includes(word),
      ).length;
      score += Math.min(12, hits * 3) + titleHits * 3;
      reasons.push('Cùng chủ đề với bài báo đang đọc');
    }
  }

  return { score, reasons };
}

function progressAdjustment(progress) {
  let score = 0;
  if (!progress) return { score: 4, reason: 'Bài chưa đọc' };
  if (progress.status === 'reading') score += 3;
  if (progress.status === 'completed') score -= 4;
  if (progress.quizAttempts > 0 && progress.quizBest < 70) {
    score += 4;
    return { score, reason: 'Bạn làm quiz chưa cao — nên ôn lại' };
  }
  if (progress.mastery >= 80) score -= 4;
  return { score, reason: progress.status === 'reading' ? 'Đang đọc dở' : '' };
}

function reasonFor(surface, reasons) {
  if (reasons.length) return reasons[0];
  return `Được chọn cho ${LEARNING_SURFACES[surface]?.vi || 'ngữ cảnh hiện tại'}`;
}

export async function recommendationsForUser(userId, { surface = 'dashboard', context, limit = 3 } = {}) {
  const ctx = normalizeContext(context);
  const now = Date.now();
  const since = new Date(now - EVENT_RETENTION_DAYS * DAY_MS);
  const recentSince = new Date(now - REVIEW_DAYS * DAY_MS);

  const [progressRows, events] = await Promise.all([
    CurriculumProgress.find({ userId }).lean(),
    LearningEvent.find({ userId, createdAt: { $gte: since } })
      .select('type lessonSlug surface createdAt')
      .lean(),
  ]);

  const progressBySlug = new Map(progressRows.map((row) => [row.lessonSlug, row]));
  const dismissed = new Set(
    events
      .filter(
        (event) =>
          event.type === 'dismiss' &&
          event.surface === surface &&
          event.createdAt >= recentSince &&
          event.lessonSlug,
      )
      .map((event) => event.lessonSlug),
  );
  const viewedRecently = new Set(
    events
      .filter((event) => event.type === 'view' && event.createdAt >= recentSince)
      .map((event) => event.lessonSlug),
  );
  const appliedRecently = new Set(
    events
      .filter((event) => event.type === 'apply' && event.createdAt >= recentSince)
      .map((event) => event.lessonSlug),
  );

  const scored = [];
  for (const lesson of LESSONS) {
    if (dismissed.has(lesson.slug)) continue;
    const meta = lessonLearningMeta(lesson);
    const { score: contextPoints, reasons } = contextScore(lesson, meta, surface, ctx);
    if (contextPoints <= 0) continue;

    const progress = progressBySlug.get(lesson.slug);
    const adjustment = progressAdjustment(progress);
    let score = contextPoints + adjustment.score;
    if (viewedRecently.has(lesson.slug)) score -= 6;
    if (appliedRecently.has(lesson.slug)) score -= 3;
    if (score <= 0) continue;

    scored.push({
      slug: lesson.slug,
      title: lesson.title,
      subtitle: lesson.subtitle,
      module: lesson.module,
      minutes: lesson.minutes,
      reason:
        adjustment.reason?.includes('ôn lại')
          ? adjustment.reason
          : reasons[0] || adjustment.reason || reasonFor(surface, reasons),
      status: progress?.status || 'new',
      mastery: progress?.mastery || 0,
      quizBest: progress?.quizBest || 0,
      keyTakeaways: meta.keyTakeaways,
      microQuiz: meta.microQuiz,
      actions: meta.actions,
      score,
    });
  }

  scored.sort((a, b) => b.score - a.score || (byOrder.get(a.slug) ?? 0) - (byOrder.get(b.slug) ?? 0));
  return scored.slice(0, Math.min(Math.max(Number(limit) || 3, 1), 6));
}

function reviewCandidates(progressRows, limit = 3) {
  return progressRows
    .filter((row) => row.quizAttempts > 0 && row.quizBest < 80)
    .sort((a, b) => (a.lastViewedAt || a.updatedAt || 0) - (b.lastViewedAt || b.updatedAt || 0))
    .slice(0, limit)
    .map((row) => {
      const lesson = LESSONS.find((item) => item.slug === row.lessonSlug);
      return lesson
        ? {
            slug: lesson.slug,
            title: lesson.title,
            minutes: lesson.minutes,
            quizBest: row.quizBest,
            mastery: row.mastery || 0,
            reason: 'Điểm quiz dưới 80% — ôn lại để nhớ lâu',
          }
        : null;
    })
    .filter(Boolean);
}

function continueLesson(progressRows) {
  const reading = progressRows
    .filter((row) => row.status === 'reading')
    .sort(
      (a, b) =>
        new Date(b.lastViewedAt || b.updatedAt || 0) - new Date(a.lastViewedAt || a.updatedAt || 0),
    )[0];
  const target =
    (reading && LESSONS.find((lesson) => lesson.slug === reading.lessonSlug)) ||
    LESSONS.find(
      (lesson) => !progressRows.some((row) => row.lessonSlug === lesson.slug && row.status === 'completed'),
    );
  return target ? { slug: target.slug, title: target.title, minutes: target.minutes } : null;
}

function countStreak(events) {
  const days = new Set(
    events.map((event) => new Date(event.createdAt).toISOString().slice(0, 10)),
  );
  let streak = 0;
  for (let offset = 0; offset < 60; offset += 1) {
    const date = new Date(Date.now() - offset * DAY_MS).toISOString().slice(0, 10);
    if (!days.has(date)) break;
    streak += 1;
  }
  return streak;
}

export async function learningSummary(userId) {
  const weekSince = new Date(Date.now() - 7 * DAY_MS);
  const monthSince = new Date(Date.now() - 30 * DAY_MS);
  const [progressRows, allEvents] = await Promise.all([
    CurriculumProgress.find({ userId }).lean(),
    LearningEvent.find({ userId, createdAt: { $gte: monthSince } })
      .select('type lessonSlug surface createdAt')
      .lean(),
  ]);
  const events = allEvents.filter((event) => new Date(event.createdAt) >= weekSince);

  const applied = events.filter((event) => event.type === 'apply');
  const appliedSlugs = [...new Set(applied.map((event) => event.lessonSlug).filter(Boolean))];
  const appliedLessons = appliedSlugs
    .map((slug) => {
      const lesson = LESSONS.find((item) => item.slug === slug);
      return lesson
        ? {
            slug,
            title: lesson.title,
            count: applied.filter((event) => event.lessonSlug === slug).length,
          }
        : null;
    })
    .filter(Boolean);
  const viewedSlugs = new Set(
    events.filter((event) => event.type === 'view').map((event) => event.lessonSlug),
  );
  const completed = progressRows.filter((row) => row.status === 'completed').length;
  const masteryValues = progressRows.map((row) => row.mastery || 0);
  const masteryAvg = masteryValues.length
    ? Math.round(masteryValues.reduce((sum, value) => sum + value, 0) / masteryValues.length)
    : 0;

  return {
    continueLesson: continueLesson(progressRows),
    reviewDue: reviewCandidates(progressRows),
    totals: {
      completed,
      total: LESSONS.length,
      masteryAvg,
      appliedActions: progressRows.reduce(
        (sum, row) => sum + (row.appliedActions?.length || 0),
        0,
      ),
    },
    week: {
      views: events.filter((event) => event.type === 'view').length,
      quizzes: events.filter((event) => event.type === 'quiz').length,
      applies: applied.length,
      uniqueViewed: viewedSlugs.size,
      uniqueApplied: appliedSlugs.length,
      appliedLessons,
    },
    streakDays: countStreak(allEvents),
  };
}

export async function nextLearningForUser(userId, profile = {}) {
  const context = {
    goal: profile.goal,
    experience: profile.experience,
    conditions: profile.healthConditions,
    query: '',
  };
  const [recommendations, summary] = await Promise.all([
    recommendationsForUser(userId, { surface: 'dashboard', context, limit: 2 }),
    learningSummary(userId),
  ]);
  return {
    ...summary,
    recommendations,
  };
}

export async function recordView(userId, lessonSlug, { surface = '' } = {}) {
  const now = new Date();
  await CurriculumProgress.findOneAndUpdate(
    { userId, lessonSlug },
    {
      $set: { lastViewedAt: now },
      $setOnInsert: { userId, lessonSlug, status: 'reading' },
    },
    { upsert: true, setDefaultsOnInsert: true },
  ).catch(() => {});
  // Refetch/React Query không nên tạo hàng chục event view cho cùng một bài.
  const recent = await LearningEvent.exists({
    userId,
    type: 'view',
    lessonSlug,
    surface,
    createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
  }).catch(() => true);
  if (!recent) {
    await LearningEvent.create({ userId, type: 'view', lessonSlug, surface }).catch(() => {});
  }
}

export async function recordQuizResult(userId, lessonSlug, score) {
  const now = new Date();
  const doc = await CurriculumProgress.findOneAndUpdate(
    { userId, lessonSlug },
    { $set: { lastViewedAt: now } },
    { new: true },
  ).lean();
  if (!doc) return null;
  const mastery = Math.min(
    100,
    Math.max(Math.round((doc.quizBest || 0) * 0.6), Math.round((score || 0) * 0.6)),
  );
  const nextMastery = Math.min(
    100,
    Math.max(mastery, Math.round((doc.quizBest || 0) * 0.6) + Math.min(40, (doc.appliedActions?.length || 0) * 10)),
  );
  await CurriculumProgress.updateOne({ _id: doc._id }, { $set: { mastery: nextMastery } });
  await LearningEvent.create({ userId, type: 'quiz', lessonSlug, metadata: { score } }).catch(() => {});
  return nextMastery;
}

export async function applyLessonAction(
  userId,
  lessonSlug,
  { actionType, label = '', surface = '', payload } = {},
) {
  const now = new Date();
  let doc = await CurriculumProgress.findOneAndUpdate(
    { userId, lessonSlug },
    {
      $set: { lastViewedAt: now },
      $push: { appliedActions: { actionType, label, surface, at: now, payload } },
      $setOnInsert: { userId, lessonSlug, status: 'reading' },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const appliedCount = doc.appliedActions?.length || 1;
  const mastery = Math.min(
    100,
    Math.round((doc.quizBest || 0) * 0.6) + Math.min(40, appliedCount * 10),
  );
  if (mastery !== doc.mastery) {
    doc = await CurriculumProgress.findByIdAndUpdate(doc._id, { mastery }, { new: true });
  }
  await LearningEvent.create({
    userId,
    type: 'apply',
    lessonSlug,
    surface,
    metadata: { actionType, label },
  }).catch(() => {});

  return { progress: doc, mastery };
}

export async function dismissRecommendation(userId, lessonSlug, surface) {
  await LearningEvent.create({ userId, type: 'dismiss', lessonSlug, surface }).catch(() => {});
}

export async function markCompleted(userId, lessonSlug) {
  await LearningEvent.create({ userId, type: 'complete', lessonSlug }).catch(() => {});
}
