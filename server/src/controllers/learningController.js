import { getUser } from '../services/authService.js';
import { LESSONS } from '../../../shared/curriculum/lessons/index.js';
import {
  applyLessonAction,
  dismissRecommendation,
  learningSummary,
  nextLearningForUser,
  recommendationsForUser,
} from '../services/learning/recommendations.js';
import { LearningEvent } from '../models/LearningEvent.js';
import { ApiError } from '../utils/ApiError.js';

function profileContext(user) {
  return {
    goal: user.profile?.goal,
    experience: user.profile?.experience,
    conditions: user.profile?.healthConditions || [],
  };
}

function requireLesson(slug) {
  const lesson = LESSONS.find((item) => item.slug === slug);
  if (!lesson) throw ApiError.notFound('Không tìm thấy bài học này');
  return lesson;
}

export async function recommendations(req, res) {
  const query = req.validatedQuery || {};
  const user = await getUser(req.userId);
  const data = await recommendationsForUser(req.userId, {
    surface: query.surface,
    limit: query.limit,
    context: {
      ...profileContext(user),
      goal: query.goal || user.profile?.goal,
      experience: query.experience || user.profile?.experience,
      conditions: query.conditions
        ? query.conditions.split(',').map((item) => item.trim()).filter(Boolean)
        : user.profile?.healthConditions,
      muscles: query.muscles,
      exercises: query.exercises,
      calculator: query.calculator,
      anatomyGroup: query.anatomyGroup,
      region: query.region,
      query: query.query,
    },
  });
  res.json({ data: { surface: query.surface, recommendations: data } });
}

export async function next(req, res) {
  const user = await getUser(req.userId);
  res.json({ data: await nextLearningForUser(req.userId, user.profile || {}) });
}

export async function summary(req, res) {
  res.json({ data: await learningSummary(req.userId) });
}

export async function apply(req, res) {
  requireLesson(req.params.slug);
  const data = await applyLessonAction(req.userId, req.params.slug, req.body);
  res.status(201).json({ data });
}

export async function dismiss(req, res) {
  requireLesson(req.body.lessonSlug);
  await dismissRecommendation(req.userId, req.body.lessonSlug, req.body.surface);
  res.json({ data: { ok: true } });
}

export async function track(req, res) {
  requireLesson(req.body.lessonSlug);
  await LearningEvent.create({
    userId: req.userId,
    type: req.body.type,
    lessonSlug: req.body.lessonSlug,
    surface: req.body.surface,
  }).catch(() => {});
  res.json({ data: { ok: true } });
}
