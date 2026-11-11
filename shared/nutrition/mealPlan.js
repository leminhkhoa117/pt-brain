/**
 * Quy tắc thuần cho kế hoạch ăn uống (meal plan).
 * Không phụ thuộc DB/AI: ngày tháng, chu kỳ 7 ngày, tổng macro và mục tiêu calo.
 */

import { calorieTarget, macroSplit } from '../calculators/index.js';

export const MEAL_PLAN_MIN_DAYS = 7;
export const MEAL_PLAN_MAX_DAYS = 90;
export const MEAL_PLAN_CYCLE_DAYS = 7;

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const round = (value, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

/** Parse 'YYYY-MM-DD' theo UTC; trả null nếu sai định dạng/ngày không tồn tại. */
export function parseDateKeySafe(key) {
  if (typeof key !== 'string' || !DATE_KEY_PATTERN.test(key)) return null;
  const date = new Date(`${key}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === key ? date : null;
}

export function toDateKeyUTC(date) {
  return date.toISOString().slice(0, 10);
}

/** Cộng/trừ ngày trên date key, không phụ thuộc timezone máy chạy. */
export function addDaysToKey(key, days) {
  const date = parseDateKeySafe(key);
  if (!date) throw new RangeError('Ngày phải có định dạng YYYY-MM-DD');
  date.setUTCDate(date.getUTCDate() + Number(days));
  return toDateKeyUTC(date);
}

/** Số ngày từ earlier đến later (later - earlier). */
export function daysBetweenKeys(later, earlier) {
  const a = parseDateKeySafe(later);
  const b = parseDateKeySafe(earlier);
  if (!a || !b) throw new RangeError('Ngày phải có định dạng YYYY-MM-DD');
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

/**
 * Chuẩn hóa khoảng thời gian plan: tối thiểu 7 ngày, tối đa 90 ngày (tính cả hai đầu).
 * Ném RangeError để controller đổi thành lỗi 400.
 */
export function validateMealPlanRange(startDate, endDate) {
  const start = parseDateKeySafe(startDate);
  const end = parseDateKeySafe(endDate);
  if (!start) throw new RangeError('Ngày bắt đầu không hợp lệ');
  if (!end) throw new RangeError('Ngày kết thúc không hợp lệ');
  if (end < start) throw new RangeError('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu');
  const durationDays = daysBetweenKeys(endDate, startDate) + 1;
  if (durationDays < MEAL_PLAN_MIN_DAYS) {
    throw new RangeError(`Khoảng thời gian tối thiểu ${MEAL_PLAN_MIN_DAYS} ngày`);
  }
  if (durationDays > MEAL_PLAN_MAX_DAYS) {
    throw new RangeError(`Khoảng thời gian tối đa ${MEAL_PLAN_MAX_DAYS} ngày (3 tháng)`);
  }
  return { startDate, endDate, durationDays };
}

export function mealPlanEndDate(startDate, durationDays) {
  const days = Number(durationDays);
  if (!Number.isInteger(days) || days < MEAL_PLAN_MIN_DAYS || days > MEAL_PLAN_MAX_DAYS) {
    throw new RangeError(`Thời lượng phải từ ${MEAL_PLAN_MIN_DAYS} đến ${MEAL_PLAN_MAX_DAYS} ngày`);
  }
  return addDaysToKey(startDate, days - 1);
}

/**
 * Chỉ số ngày trong chu kỳ 7 ngày. Trả null nếu dateKey trước ngày bắt đầu.
 * Ví dụ: bắt đầu 2026-01-01, ngày 2026-01-08 -> 0 (lặp lại ngày đầu).
 */
export function cycleIndexForDate(startDate, dateKey, cycleDays = MEAL_PLAN_CYCLE_DAYS) {
  const length = Number(cycleDays);
  if (!Number.isInteger(length) || length < 1)
    throw new RangeError('Chu kỳ phải là số nguyên dương');
  const diff = daysBetweenKeys(dateKey, startDate);
  if (diff < 0) return null;
  return diff % length;
}

/** Trạng thái plan theo ngày hiện tại + số ngày đã qua/còn lại (tính cả hôm nay). */
export function mealPlanPhase(startDate, endDate, todayKey) {
  const totalDays = daysBetweenKeys(endDate, startDate) + 1;
  if (todayKey < startDate) {
    return {
      status: 'upcoming',
      totalDays,
      daysUntilStart: daysBetweenKeys(startDate, todayKey),
      daysElapsed: 0,
      daysRemaining: totalDays,
      cycleIndex: null,
    };
  }
  if (todayKey > endDate) {
    return {
      status: 'ended',
      totalDays,
      daysUntilStart: null,
      daysElapsed: totalDays,
      daysRemaining: 0,
      cycleIndex: null,
    };
  }
  const daysElapsed = daysBetweenKeys(todayKey, startDate);
  return {
    status: 'active',
    totalDays,
    daysUntilStart: 0,
    daysElapsed,
    daysRemaining: totalDays - daysElapsed,
    cycleIndex: daysElapsed % MEAL_PLAN_CYCLE_DAYS,
  };
}

export function sumFoods(foods = []) {
  const totals = (Array.isArray(foods) ? foods : []).reduce(
    (sum, food) => ({
      calories: sum.calories + (Number(food?.calories) || 0),
      proteinG: sum.proteinG + (Number(food?.proteinG) || 0),
      carbsG: sum.carbsG + (Number(food?.carbsG) || 0),
      fatG: sum.fatG + (Number(food?.fatG) || 0),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
  return {
    calories: Math.round(totals.calories),
    proteinG: round(totals.proteinG),
    carbsG: round(totals.carbsG),
    fatG: round(totals.fatG),
  };
}

export function sumMeals(meals = []) {
  const totals = (Array.isArray(meals) ? meals : []).reduce(
    (sum, meal) => {
      const mealTotals = sumFoods(meal?.foods || []);
      return {
        calories: sum.calories + mealTotals.calories,
        proteinG: sum.proteinG + mealTotals.proteinG,
        carbsG: sum.carbsG + mealTotals.carbsG,
        fatG: sum.fatG + mealTotals.fatG,
      };
    },
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
  return {
    calories: Math.round(totals.calories),
    proteinG: round(totals.proteinG),
    carbsG: round(totals.carbsG),
    fatG: round(totals.fatG),
  };
}

/* ------------------------------------------------------------------ */
/* Đánh giá tuần: thực tế ăn so với plan                               */
/* ------------------------------------------------------------------ */

const MEAL_TYPE_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];

const MEAL_TYPE_LABELS = {
  breakfast: 'Bữa sáng',
  lunch: 'Bữa trưa',
  dinner: 'Bữa tối',
  snack: 'Bữa phụ',
};

/** Chia plan thành các tuần 7 ngày; tuần cuối có thể ngắn hơn. */
export function mealPlanWeekWindows(startDate, endDate) {
  const range = validateMealPlanRange(startDate, endDate);
  const windows = [];
  for (let offset = 0; offset < range.durationDays; offset += MEAL_PLAN_CYCLE_DAYS) {
    const start = addDaysToKey(startDate, offset);
    const plannedEnd = addDaysToKey(startDate, offset + MEAL_PLAN_CYCLE_DAYS - 1);
    const end = plannedEnd > endDate ? endDate : plannedEnd;
    windows.push({
      weekIndex: windows.length,
      label: `Tuần ${windows.length + 1}`,
      start,
      end,
      days: daysBetweenKeys(end, start) + 1,
    });
  }
  return windows;
}

function emptyTotals() {
  return { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };
}

function addTotals(target, source) {
  target.calories += Number(source?.calories) || 0;
  target.proteinG += Number(source?.proteinG) || 0;
  target.carbsG += Number(source?.carbsG) || 0;
  target.fatG += Number(source?.fatG) || 0;
  return target;
}

function finalizeTotals(totals) {
  return {
    calories: Math.round(totals.calories),
    proteinG: round(totals.proteinG, 1),
    carbsG: round(totals.carbsG, 1),
    fatG: round(totals.fatG, 1),
  };
}

function totalsByMealType(sourceTotals, meals = []) {
  const result = Object.fromEntries(MEAL_TYPE_ORDER.map((type) => [type, emptyTotals()]));
  for (const meal of Array.isArray(meals) ? meals : []) {
    const type = MEAL_TYPE_ORDER.includes(meal?.type) ? meal.type : 'lunch';
    addTotals(result[type], sourceTotals?.(meal));
  }
  return result;
}

function scoreCalories(ratio) {
  // Trong ±10% là đạt; lệch 35% trở lên thì 0 điểm.
  const deviation = Math.abs(ratio - 1);
  if (!Number.isFinite(ratio)) return 0;
  return Math.max(0, Math.min(1, 1 - Math.max(0, deviation - 0.1) / 0.25));
}

function scoreProtein(actual, planned) {
  if (!planned) return 0;
  // Đạt ≥90% mục tiêu là 100%; thấp hơn thì giảm dần tới 0 khi chỉ còn 50%.
  const ratio = actual / planned;
  if (ratio >= 0.9) return 1;
  return Math.max(0, Math.min(1, (ratio - 0.5) / 0.4));
}

export function adherenceGrade(score) {
  if (score >= 85) return { label: 'Rất bám plan', tone: 'emerald' };
  if (score >= 70) return { label: 'Khá tốt', tone: 'brand' };
  if (score >= 50) return { label: 'Trung bình', tone: 'amber' };
  return { label: 'Lệch plan', tone: 'rose' };
}

/**
 * So sánh thực tế ăn (bảng Meal) với thực đơn mẫu 7 ngày của plan trong 1 tuần.
 * Chỉ tính các ngày đã tới (<= todayKey) và nằm trong khoảng plan.
 * `meals`: [{ dateKey, mealType, analysis: { totals } }]
 */
export function computeMealPlanAdherence({ plan, meals = [], weekStart, weekEnd, todayKey }) {
  const cycleDays = Array.isArray(plan?.cycleDays) ? plan.cycleDays : [];
  if (cycleDays.length !== MEAL_PLAN_CYCLE_DAYS) {
    throw new RangeError('Plan chưa có đủ 7 ngày thực đơn mẫu để đánh giá');
  }

  const start = weekStart > plan.startDate ? weekStart : plan.startDate;
  const end = weekEnd < plan.endDate ? weekEnd : plan.endDate;
  if (start > end) throw new RangeError('Tuần đánh giá nằm ngoài khoảng thời gian của plan');

  const byDate = new Map();
  for (const meal of Array.isArray(meals) ? meals : []) {
    if (!meal?.dateKey) continue;
    if (!byDate.has(meal.dateKey)) byDate.set(meal.dateKey, []);
    byDate.get(meal.dateKey).push(meal);
  }

  const rows = [];
  const plannedMealTypeTotals = totalsByMealType(
    (meal) => meal?.totals,
    cycleDays.flatMap((day) => day.meals || []),
  );
  const actualMealTypeTotals = Object.fromEntries(
    MEAL_TYPE_ORDER.map((type) => [type, emptyTotals()]),
  );
  let countedDays = 0;
  let loggedDays = 0;
  let calorieScoreSum = 0;
  let proteinScoreSum = 0;
  const plannedSum = emptyTotals();
  const actualSum = emptyTotals();

  for (let cursor = start; cursor <= end; cursor = addDaysToKey(cursor, 1)) {
    if (cursor > todayKey) continue;
    const cycleIndex = cycleIndexForDate(plan.startDate, cursor, MEAL_PLAN_CYCLE_DAYS);
    const plannedDay = cycleDays[cycleIndex];
    if (!plannedDay) continue;

    const dayMeals = byDate.get(cursor) || [];
    const actual = emptyTotals();
    for (const meal of dayMeals) {
      addTotals(actual, meal.analysis?.totals);
      const type = MEAL_TYPE_ORDER.includes(meal.mealType) ? meal.mealType : 'lunch';
      addTotals(actualMealTypeTotals[type], meal.analysis?.totals);
    }

    const planned = plannedDay.totals || sumMeals(plannedDay.meals);
    const logged = dayMeals.length > 0;
    countedDays += 1;
    addTotals(plannedSum, planned);
    if (logged) {
      loggedDays += 1;
      addTotals(actualSum, actual);
      calorieScoreSum += scoreCalories(planned.calories ? actual.calories / planned.calories : 1);
      proteinScoreSum += scoreProtein(actual.proteinG, planned.proteinG);
    }

    rows.push({
      dateKey: cursor,
      cycleIndex,
      logged,
      meals: dayMeals.length,
      planned,
      actual: finalizeTotals(actual),
      calorieDeltaPct: planned.calories
        ? Math.round(((actual.calories - planned.calories) / planned.calories) * 100)
        : 0,
    });
  }

  if (!countedDays) {
    throw new RangeError('Tuần này chưa có ngày nào trong plan để đánh giá');
  }

  const coverage = loggedDays / countedDays;
  const calorieScore = loggedDays ? calorieScoreSum / loggedDays : 0;
  const proteinScore = loggedDays ? proteinScoreSum / loggedDays : 0;
  const score = Math.round(100 * (0.4 * coverage + 0.35 * calorieScore + 0.25 * proteinScore));

  const mealTypeRows = MEAL_TYPE_ORDER.map((type) => {
    const plannedAvg = finalizeTotals({
      calories: plannedMealTypeTotals[type].calories / MEAL_PLAN_CYCLE_DAYS,
      proteinG: plannedMealTypeTotals[type].proteinG / MEAL_PLAN_CYCLE_DAYS,
      carbsG: plannedMealTypeTotals[type].carbsG / MEAL_PLAN_CYCLE_DAYS,
      fatG: plannedMealTypeTotals[type].fatG / MEAL_PLAN_CYCLE_DAYS,
    });
    const actualAvg = finalizeTotals({
      calories: loggedDays ? actualMealTypeTotals[type].calories / loggedDays : 0,
      proteinG: loggedDays ? actualMealTypeTotals[type].proteinG / loggedDays : 0,
      carbsG: loggedDays ? actualMealTypeTotals[type].carbsG / loggedDays : 0,
      fatG: loggedDays ? actualMealTypeTotals[type].fatG / loggedDays : 0,
    });
    return {
      type,
      label: MEAL_TYPE_LABELS[type],
      planned: plannedAvg,
      actual: actualAvg,
    };
  });

  return {
    weekStart: start,
    weekEnd: end,
    days: daysBetweenKeys(end, start) + 1,
    countedDays,
    loggedDays,
    missedDays: countedDays - loggedDays,
    coveragePct: Math.round(coverage * 100),
    score,
    grade: adherenceGrade(score).label,
    gradeTone: adherenceGrade(score).tone,
    averages: {
      planned: finalizeTotals({
        calories: plannedSum.calories / countedDays,
        proteinG: plannedSum.proteinG / countedDays,
        carbsG: plannedSum.carbsG / countedDays,
        fatG: plannedSum.fatG / countedDays,
      }),
      actual: finalizeTotals({
        calories: loggedDays ? actualSum.calories / loggedDays : 0,
        proteinG: loggedDays ? actualSum.proteinG / loggedDays : 0,
        carbsG: loggedDays ? actualSum.carbsG / loggedDays : 0,
        fatG: loggedDays ? actualSum.fatG / loggedDays : 0,
      }),
    },
    rows,
    mealTypes: mealTypeRows,
  };
}

/**
 * Mục tiêu calo/macro/ngày tính bằng code, không để AI tự bịa.
 * Protein 2.0 g/kg khi giảm mỡ, 1.8 g/kg cho các mục tiêu còn lại; fat 0.8 g/kg.
 */
export function computeDailyTargets({ tdee, weightKg, goal = 'maintain' }) {
  const proteinPerKg = goal === 'cut' ? 2.0 : 1.8;
  const fatPerKg = 0.8;
  const calories = calorieTarget(tdee, goal);
  const macros = macroSplit({
    weightKg,
    calories: calories.recommended,
    proteinPerKg,
    fatPerKg,
  });
  return {
    calories: calories.recommended,
    calorieRange: { min: calories.min, max: calories.max },
    proteinG: macros.proteinG,
    carbsG: macros.carbG,
    fatG: macros.fatG,
    proteinPerKg,
    fatPerKg,
    feasible: macros.feasible,
    note: macros.note,
  };
}
