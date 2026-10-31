import { z } from 'zod';
import {
  ACTIVITY_FACTORS,
  GOAL_CALORIE_ADJUSTMENT,
  MUSCLE_VOLUME_TARGET,
} from '../../../../shared/config/nutrition.js';
import {
  bmi,
  bmrMifflinStJeor,
  brzycki1RM,
  calorieTarget,
  epley1RM,
  estimateOneRepMax,
  ffmi,
  hrZones,
  leanBodyMass,
  macroSplit,
  navyBodyFat,
  percent1RMTable,
  setsByMuscle,
  tdeeFromBmr,
  tonnage,
  volumeByMuscle,
  volumeStatus,
} from '../../../../shared/calculators/index.js';

const activityLevel = z.enum(Object.keys(ACTIVITY_FACTORS));
const goal = z.enum(Object.keys(GOAL_CALORIE_ADJUSTMENT));

const positive = z.coerce.number().positive();

const setSchema = z.object({
  weightKg: z.coerce.number().min(0).max(1000),
  reps: z.coerce.number().int().min(0).max(200),
  muscleGroup: z.string().max(60).optional(),
});

/**
 * Registry máy tính: mỗi loại có schema zod + hàm chạy.
 * Backend dùng để tính qua API; client dùng lại chính hàm trong shared/calculators.
 */
export const calculators = {
  'one-rep-max': {
    schema: z.object({
      weightKg: positive,
      reps: z.coerce.number().int().min(1).max(30),
    }),
    run: (input) => ({
      ...estimateOneRepMax(input),
      epleyFormula: 'w × (1 + reps/30)',
      brzyckiFormula: 'w × 36 / (37 − reps)',
    }),
  },

  'percent-1rm': {
    schema: z.object({ oneRepMaxKg: positive }),
    run: ({ oneRepMaxKg }) => ({ table: percent1RMTable(oneRepMaxKg) }),
  },

  bmr: {
    schema: z.object({
      sex: z.enum(['male', 'female']),
      weightKg: positive,
      heightCm: positive,
      age: z.coerce.number().min(14).max(100),
    }),
    run: (input) => ({
      bmr: bmrMifflinStJeor(input),
      formula: 'Mifflin-St Jeor',
    }),
  },

  tdee: {
    schema: z
      .object({
        bmr: positive.optional(),
        sex: z.enum(['male', 'female']).optional(),
        weightKg: positive.optional(),
        heightCm: positive.optional(),
        age: z.coerce.number().min(14).max(100).optional(),
        activityLevel,
      })
      .refine((d) => d.bmr || (d.sex && d.weightKg && d.heightCm && d.age), {
        message: 'Cần bmr hoặc đủ sex/weightKg/heightCm/age',
      }),
    run: (input) => {
      const bmr = input.bmr ?? bmrMifflinStJeor(input);
      return {
        bmr,
        tdee: tdeeFromBmr(bmr, input.activityLevel),
        activityFactor: ACTIVITY_FACTORS[input.activityLevel],
      };
    },
  },

  calories: {
    schema: z.object({ tdee: positive, goal }),
    run: ({ tdee, goal: g }) => calorieTarget(tdee, g),
  },

  macro: {
    schema: z.object({
      weightKg: positive,
      calories: positive,
      proteinPerKg: z.coerce.number().min(0.5).max(4).optional(),
      fatPerKg: z.coerce.number().min(0.2).max(2).optional(),
    }),
    run: (input) => macroSplit(input),
  },

  'navy-body-fat': {
    schema: z
      .object({
        sex: z.enum(['male', 'female']),
        heightCm: positive,
        neckCm: positive,
        waistCm: positive,
        hipCm: positive.optional(),
      })
      .refine((d) => d.sex === 'male' || d.hipCm, {
        message: 'Nữ cần nhập vòng mông (hipCm)',
      }),
    run: (input) => ({ bodyFatPct: navyBodyFat(input) }),
  },

  lbm: {
    schema: z.object({
      weightKg: positive,
      bodyFatPct: z.coerce.number().gt(0).lt(70),
    }),
    run: ({ weightKg, bodyFatPct }) => ({
      leanMassKg: leanBodyMass(weightKg, bodyFatPct),
      fatMassKg: Math.round((weightKg * bodyFatPct) / 100) / 10,
    }),
  },

  ffmi: {
    schema: z.object({ leanMassKg: positive, heightCm: positive }),
    run: ({ leanMassKg, heightCm }) => ffmi(leanMassKg, heightCm),
  },

  bmi: {
    schema: z.object({ weightKg: positive, heightCm: positive }),
    run: ({ weightKg, heightCm }) => bmi(weightKg, heightCm),
  },

  'hr-zones': {
    schema: z
      .object({
        age: z.coerce.number().min(14).max(100).optional(),
        maxHr: positive.optional(),
        restingHr: positive.optional(),
      })
      .refine((d) => d.maxHr || d.age, { message: 'Cần age hoặc maxHr' }),
    run: (input) => hrZones(input),
  },

  tonnage: {
    schema: z.object({ sets: z.array(setSchema).max(200) }),
    run: ({ sets }) => ({
      tonnage: tonnage(sets),
      setsByMuscle: setsByMuscle(sets),
      totalSets: sets.length,
    }),
  },

  volume: {
    schema: z.object({
      sessions: z
        .array(z.object({ sets: z.array(setSchema).max(200) }))
        .max(60),
      target: z
        .object({ min: z.coerce.number().min(0), max: z.coerce.number().min(1) })
        .optional(),
    }),
    run: ({ sessions, target = MUSCLE_VOLUME_TARGET }) => {
      const volume = volumeByMuscle(sessions);
      return { volume, status: volumeStatus(volume, target), target };
    },
  },

  // Trả về cả 2 công thức riêng để hiển thị chi tiết
  'one-rep-max-formulas': {
    schema: z.object({
      weightKg: positive,
      reps: z.coerce.number().int().min(1).max(30),
    }),
    run: ({ weightKg, reps }) => ({
      epley: Math.round(epley1RM(weightKg, reps) * 10) / 10,
      brzycki: Math.round(brzycki1RM(weightKg, reps) * 10) / 10,
    }),
  },
};

export function getCalculator(type) {
  return calculators[type];
}
