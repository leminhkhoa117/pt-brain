import { BodyLog } from '../models/BodyLog.js';
import { Meal } from '../models/Meal.js';
import { MealPlan } from '../models/MealPlan.js';
import { MealPlanReview } from '../models/MealPlanReview.js';
import { getUser } from '../services/authService.js';
import { assertAiQuota, getAiUsage, recordAiCall } from '../services/ai/quota.js';
import { generateMealPlanProposal, targetsForUser } from '../services/ai/mealPlanner.js';
import { generateMealPlanWeekReview } from '../services/ai/mealPlanReview.js';
import { evidenceReferences } from '../research/evidenceBase.js';
import { mealPlanCreateSchema, mealPlanSuggestSchema } from '../validation/mealPlan.js';
import { ApiError } from '../utils/ApiError.js';
import { todayKeyVN } from '../utils/date.js';
import {
  computeMealPlanAdherence,
  mealPlanWeekWindows,
  sumFoods,
  sumMeals,
  validateMealPlanRange,
} from '../../../shared/nutrition/mealPlan.js';

const EVIDENCE_IDS = ['E3', 'E7'];

function parseRange(startDate, endDate) {
  try {
    return validateMealPlanRange(startDate, endDate);
  } catch (error) {
    throw ApiError.badRequest(error.message);
  }
}

function withEvidence(plan) {
  const value = typeof plan.toObject === 'function' ? plan.toObject() : plan;
  return {
    ...value,
    evidence: evidenceReferences(
      (value.evidenceIds || []).filter((id) => EVIDENCE_IDS.includes(id)),
    ),
  };
}

async function latestWeight(userId) {
  const log = await BodyLog.findOne({ userId }).sort({ dateKey: -1 }).lean();
  return log?.weightKg || null;
}

async function buildTargets(userId, goal) {
  const [user, weightKg] = await Promise.all([getUser(userId), latestWeight(userId)]);
  const result = targetsForUser({ user, weightKg, goal });
  return { user, weightKg, ...result };
}

function buildCycleDays(rawDays) {
  return rawDays.map((day, dayIndex) => {
    const meals = day.meals.map((meal, mealIndex) => {
      const foods = meal.foods.map((food) => ({
        name: food.name,
        portion: food.portion,
        calories: Math.round(food.calories),
        proteinG: Math.round(food.proteinG * 10) / 10,
        carbsG: Math.round(food.carbsG * 10) / 10,
        fatG: Math.round(food.fatG * 10) / 10,
      }));
      return {
        type: meal.type || ['breakfast', 'lunch', 'dinner', 'snack'][Math.min(mealIndex, 3)],
        name: meal.name,
        foods,
        totals: sumFoods(foods),
      };
    });
    return {
      label: day.label || `Ngày ${dayIndex + 1}`,
      meals,
      totals: sumMeals(meals),
    };
  });
}

/** Plan tự tạo: mục tiêu ngày = trung bình 7 ngày của chính thực đơn người dùng nhập. */
function averageDailyTargets(cycleDays) {
  const totals = cycleDays.reduce(
    (sum, day) => ({
      calories: sum.calories + (day.totals?.calories || 0),
      proteinG: sum.proteinG + (day.totals?.proteinG || 0),
      carbsG: sum.carbsG + (day.totals?.carbsG || 0),
      fatG: sum.fatG + (day.totals?.fatG || 0),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
  return {
    calories: Math.round(totals.calories / cycleDays.length),
    proteinG: Math.round((totals.proteinG / cycleDays.length) * 10) / 10,
    carbsG: Math.round((totals.carbsG / cycleDays.length) * 10) / 10,
    fatG: Math.round((totals.fatG / cycleDays.length) * 10) / 10,
  };
}

async function getPlan(userId, id) {
  const plan = await MealPlan.findOne({ _id: id, userId });
  if (!plan) throw ApiError.notFound('Không tìm thấy kế hoạch ăn uống');
  return plan;
}

function weekList(plan) {
  return mealPlanWeekWindows(plan.startDate, plan.endDate);
}

function findWeek(plan, weekStart) {
  const weeks = weekList(plan);
  if (!weekStart) {
    const today = todayKeyVN();
    const started = weeks.filter((week) => week.start <= today);
    return started.length ? started[started.length - 1] : weeks[0];
  }
  const found = weeks.find((week) => week.start === weekStart);
  if (!found) throw ApiError.badRequest('Tuần đánh giá không thuộc kế hoạch này');
  return found;
}

async function adherenceFor(plan, week) {
  const meals = await Meal.find({
    userId: plan.userId,
    dateKey: { $gte: week.start, $lte: week.end },
  }).lean();
  try {
    return computeMealPlanAdherence({
      plan: plan.toObject ? plan.toObject() : plan,
      meals,
      weekStart: week.start,
      weekEnd: week.end,
      todayKey: todayKeyVN(),
    });
  } catch (error) {
    throw ApiError.badRequest(error.message);
  }
}

export async function adherence(req, res) {
  const plan = await getPlan(req.userId, req.params.id);
  const week = findWeek(plan, typeof req.query.weekStart === 'string' ? req.query.weekStart : '');
  const stats = await adherenceFor(plan, week);
  const review = await MealPlanReview.findOne({
    userId: req.userId,
    planId: plan._id,
    weekStart: week.start,
  }).lean();
  res.json({ data: { week, adherence: stats, todayKey: todayKeyVN(), review } });
}

export async function reviews(req, res) {
  const plan = await getPlan(req.userId, req.params.id);
  const weeks = weekList(plan);
  const items = await MealPlanReview.find({ userId: req.userId, planId: plan._id })
    .sort({ weekStart: 1 })
    .lean();
  const byWeek = new Map(items.map((item) => [item.weekStart, item]));
  const today = todayKeyVN();
  res.json({
    data: {
      weeks: weeks.map((week) => {
        const review = byWeek.get(week.start);
        return {
          ...week,
          isPast: week.end <= today,
          hasReview: Boolean(review),
          score: review?.score ?? null,
          grade: review?.grade || '',
          reviewId: review?._id || null,
        };
      }),
      reviews: items,
      todayKey: today,
    },
  });
}

export async function evaluateWeek(req, res) {
  const plan = await getPlan(req.userId, req.params.id);
  const weekStart = typeof req.body?.weekStart === 'string' ? req.body.weekStart : '';
  const week = findWeek(plan, weekStart);
  const stats = await adherenceFor(plan, week);
  const user = await getUser(req.userId);

  await assertAiQuota(req.userId, 'mealplan');
  const review = await generateMealPlanWeekReview({
    plan: plan.toObject ? plan.toObject() : plan,
    stats,
    week,
    profile: {
      sex: user.profile?.sex,
      age: user.age(),
      heightCm: user.profile?.heightCm,
      goal: plan.goal,
      weightKg: await latestWeight(req.userId),
    },
  });
  await recordAiCall(req.userId, { kind: 'mealplan', usage: review.usage || {} });
  const saved = await MealPlanReview.findOneAndUpdate(
    { userId: req.userId, planId: plan._id, weekStart: week.start },
    {
      $set: {
        weekIndex: week.weekIndex,
        weekEnd: week.end,
        score: stats.score,
        grade: stats.grade,
        content: { ...stats, review },
        model: review.model,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  res.status(201).json({
    data: {
      week,
      adherence: stats,
      review: { ...saved.toObject(), source: review.source },
      quota: await getAiUsage(req.userId),
    },
  });
}

export async function aiSuggest(req, res) {
  const params = mealPlanSuggestSchema.parse(req.body || {});
  const range = parseRange(params.startDate, params.endDate);
  if (params.startDate < todayKeyVN()) {
    throw ApiError.badRequest('Ngày bắt đầu không được trước hôm nay');
  }

  const { user, weightKg, targets } = await buildTargets(req.userId, params.goal);
  await assertAiQuota(req.userId, 'mealplan');

  const result = await generateMealPlanProposal({
    profile: {
      sex: user.profile?.sex,
      age: user.age(),
      heightCm: user.profile?.heightCm,
      activityLevel: user.profile?.activityLevel,
      goal: params.goal,
      experience: user.profile?.experience,
      weightKg,
      startDate: range.startDate,
      endDate: range.endDate,
      durationDays: range.durationDays,
    },
    params: { ...params, ...range },
    targets,
    weightKg,
  });

  if (result.usage) {
    await recordAiCall(req.userId, { kind: 'mealplan', usage: result.usage });
  }

  res.json({
    data: {
      ...result,
      quota: await getAiUsage(req.userId),
    },
  });
}

export async function create(req, res) {
  const data = mealPlanCreateSchema.parse(req.body || {});
  const range = parseRange(data.startDate, data.endDate);
  const cycleDays = buildCycleDays(data.cycleDays);

  let dailyTargets;
  if (data.source === 'manual') {
    dailyTargets = averageDailyTargets(cycleDays);
  } else {
    const { targets } = await buildTargets(req.userId, data.goal);
    dailyTargets = {
      calories: targets.calories,
      proteinG: targets.proteinG,
      carbsG: targets.carbsG,
      fatG: targets.fatG,
    };
  }

  const plan = await MealPlan.create({
    userId: req.userId,
    name: data.name,
    goal: data.goal,
    startDate: range.startDate,
    endDate: range.endDate,
    durationDays: range.durationDays,
    status: 'active',
    dailyTargets,
    cycleDays,
    preferences: data.preferences,
    rationale: data.rationale,
    cautions: data.cautions,
    evidenceIds: data.evidenceIds.filter((id) => EVIDENCE_IDS.includes(id)),
    source: data.source,
    model: data.model,
  });

  await MealPlan.updateMany(
    { userId: req.userId, _id: { $ne: plan._id }, status: 'active' },
    { $set: { status: 'archived' } },
  );

  res.status(201).json({ data: { plan: withEvidence(plan) } });
}

export async function update(req, res) {
  const plan = await MealPlan.findOne({ _id: req.params.id, userId: req.userId });
  if (!plan) throw ApiError.notFound('Không tìm thấy kế hoạch ăn uống');
  if (plan.source !== 'manual') {
    throw ApiError.badRequest('Chỉ kế hoạch do bạn tự tạo mới có thể chỉnh sửa.');
  }

  const data = mealPlanCreateSchema.parse(req.body || {});
  const range = parseRange(data.startDate, data.endDate);
  const cycleDays = buildCycleDays(data.cycleDays);

  plan.name = data.name;
  plan.goal = data.goal;
  plan.startDate = range.startDate;
  plan.endDate = range.endDate;
  plan.durationDays = range.durationDays;
  plan.cycleDays = cycleDays;
  plan.dailyTargets = averageDailyTargets(cycleDays);
  plan.preferences = data.preferences;
  plan.rationale = data.rationale;
  plan.cautions = data.cautions;
  await plan.save();

  res.json({ data: { plan: withEvidence(plan) } });
}

export async function list(req, res) {
  const plans = await MealPlan.find({ userId: req.userId })
    .sort({ status: 1, startDate: -1, createdAt: -1 })
    .limit(30)
    .lean();
  res.json({
    data: {
      plans: plans.map(withEvidence),
      todayKey: todayKeyVN(),
    },
  });
}

export async function activate(req, res) {
  const plan = await MealPlan.findOne({ _id: req.params.id, userId: req.userId });
  if (!plan) throw ApiError.notFound('Không tìm thấy kế hoạch ăn uống');

  const today = todayKeyVN();
  if (plan.endDate < today) {
    throw ApiError.badRequest('Kế hoạch này đã kết thúc, hãy tạo hoặc chọn kế hoạch mới.');
  }

  await MealPlan.updateMany(
    { userId: req.userId, _id: { $ne: plan._id }, status: 'active' },
    { $set: { status: 'archived' } },
  );
  plan.status = 'active';
  await plan.save();
  res.json({ data: { plan: withEvidence(plan) } });
}

export async function remove(req, res) {
  const plan = await MealPlan.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!plan) throw ApiError.notFound('Không tìm thấy kế hoạch ăn uống');
  await MealPlanReview.deleteMany({ userId: req.userId, planId: plan._id });
  res.json({ data: { ok: true } });
}
