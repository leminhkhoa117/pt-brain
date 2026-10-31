import { volumeFromDays } from '../../../../shared/training/planner.js';

const PUSH = new Set(['chest', 'shoulders', 'triceps']);
const PULL = new Set(['back', 'biceps']);
const UPPER = new Set(['chest', 'back', 'shoulders', 'biceps', 'triceps']);
const MAJOR = ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'glutes'];

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
const ratioScore = (value, min, max, tolerance = 0.25) => {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= min && value <= max) return 100;
  const diff = value < min ? min - value : value - max;
  return clamp(100 - (diff / tolerance) * 40);
};

/** Tính chỉ số giáo án từ dữ liệu thuần (không DB) để chấm điểm ổn định. */
export function computeProgramMetrics(program, exerciseMap = {}) {
  const days = program.days || [];
  const volume = volumeFromDays(days);
  const frequency = {};
  let totalSets = 0;
  let rirSum = 0;
  let rirCount = 0;
  let repMinSum = 0;
  let repMaxSum = 0;
  let repCount = 0;
  let compound = 0;
  let exerciseCount = 0;
  let pushSets = 0;
  let pullSets = 0;
  let upperSets = 0;
  let lowerSets = 0;

  for (const day of days) {
    const musclesToday = new Set();
    for (const exercise of day.exercises || []) {
      const sets = Number(exercise.sets) || 0;
      totalSets += sets;
      exerciseCount += 1;
      musclesToday.add(exercise.muscleGroup);
      if (PUSH.has(exercise.muscleGroup)) pushSets += sets;
      if (PULL.has(exercise.muscleGroup)) pullSets += sets;
      if (UPPER.has(exercise.muscleGroup)) upperSets += sets;
      else lowerSets += sets;
      if (exercise.targetRir !== undefined) {
        rirSum += Number(exercise.targetRir);
        rirCount += 1;
      }
      if (exercise.repRange) {
        repMinSum += Number(exercise.repRange.min) || 0;
        repMaxSum += Number(exercise.repRange.max) || 0;
        repCount += 1;
      }
      const meta = exerciseMap[exercise.name];
      if (meta?.isCompound) compound += 1;
    }
    for (const muscle of musclesToday) {
      frequency[muscle] = (frequency[muscle] || 0) + 1;
    }
  }

  const avgRir = rirCount ? rirSum / rirCount : null;
  const avgRepMin = repCount ? repMinSum / repCount : null;
  const avgRepMax = repCount ? repMaxSum / repCount : null;
  const compoundRatio = exerciseCount ? compound / exerciseCount : 0;
  const pushPullRatio = pullSets ? pushSets / pullSets : pushSets ? 2 : 1;
  const upperLowerRatio = lowerSets ? upperSets / lowerSets : upperSets ? 2 : 1;

  const majorMuscles = MAJOR.map((muscle) => ({
    muscle,
    sets: volume[muscle] || 0,
    frequency: frequency[muscle] || 0,
  }));

  const volumeScore = clamp(
    (majorMuscles.reduce((sum, item) => {
      if (item.sets === 0) return sum + 20;
      if (item.sets < 6) return sum + 35;
      if (item.sets <= 20) return sum + 100;
      if (item.sets <= 25) return sum + 70;
      return sum + 40;
    }, 0) /
      majorMuscles.length) *
      1,
  );

  const frequencyScore = clamp(
    (majorMuscles.reduce(
      (sum, item) => sum + (item.frequency >= 3 ? 100 : item.frequency === 2 ? 90 : item.frequency === 1 ? 50 : 0),
      0,
    ) /
      majorMuscles.length) *
      1,
  );

  const balanceScore = clamp(
    (ratioScore(pushPullRatio, 0.8, 1.25, 0.35) + ratioScore(upperLowerRatio, 0.8, 1.25, 0.35)) / 2,
  );

  const effortScore = clamp(
    avgRir === null ? 50 : avgRir >= 1 && avgRir <= 3 ? 100 : avgRir < 1 ? 55 : 70,
  );

  const daysPerWeek = Number(program.daysPerWeek) || days.length;
  const recoveryScore = clamp(
    (daysPerWeek <= 6 ? 70 : 30) +
      (program.deloadEveryWeeks && program.deloadEveryWeeks >= 4 && program.deloadEveryWeeks <= 8 ? 30 : 10),
  );

  const specificityScore = clamp(
    (compoundRatio >= 0.35 ? 50 : compoundRatio * 100) +
      (avgRepMax && avgRepMax >= 6 && avgRepMax <= 15 ? 50 : 25),
  );

  const progressionScore = clamp(
    (days.every((day) => (day.exercises || []).every((e) => e.repRange && e.targetRir !== undefined))
      ? 70
      : 30) + (program.deloadEveryWeeks ? 30 : 0),
  );

  const subscores = [
    { key: 'volume', label: 'Volume', score: volumeScore, weight: 0.3 },
    { key: 'frequency', label: 'Tần suất', score: frequencyScore, weight: 0.2 },
    { key: 'balance', label: 'Cân bằng', score: balanceScore, weight: 0.15 },
    { key: 'effort', label: 'Mức nỗ lực (RIR)', score: effortScore, weight: 0.15 },
    { key: 'recovery', label: 'Hồi phục & deload', score: recoveryScore, weight: 0.1 },
    { key: 'specificity', label: 'Đặc hiệu mục tiêu', score: specificityScore, weight: 0.1 },
    { key: 'progression', label: 'Tiến bộ', score: progressionScore, weight: 0.1 },
  ];
  const weightSum = subscores.reduce((s, item) => s + item.weight, 0);
  const score = clamp(
    subscores.reduce((sum, item) => sum + item.score * item.weight, 0) / weightSum,
  );
  const grade =
    score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';

  return {
    score,
    grade,
    volume,
    frequency,
    totalSets,
    exerciseCount,
    days: days.length,
    daysPerWeek,
    avgRir: avgRir === null ? null : Math.round(avgRir * 10) / 10,
    avgRepRange: avgRepMin && avgRepMax ? { min: Math.round(avgRepMin), max: Math.round(avgRepMax) } : null,
    compoundRatio: Math.round(compoundRatio * 100),
    pushPullRatio: Math.round(pushPullRatio * 100) / 100,
    upperLowerRatio: Math.round(upperLowerRatio * 100) / 100,
    majorMuscles,
    subscores,
  };
}

export function gradeForScore(score) {
  return score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';
}
