import { z } from 'zod';

const confidence = z.preprocess(
  (v) => {
    const value = String(v || '').toLowerCase();
    if (value.includes('high') || value.includes('cao')) return 'high';
    if (value.includes('medium') || value.includes('trung')) return 'medium';
    return 'low';
  },
  z.enum(['low', 'medium', 'high']),
);

const stringArray = z.preprocess((v) => {
  if (typeof v === 'string') return [v];
  return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
}, z.array(z.string()).default([]));

export const bodyAssessmentFormSchema = z.object({
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  goal: z.enum(['cut', 'maintain', 'lean_bulk', 'bulk']).optional(),
  notes: z.string().max(2000).optional().default(''),
  views: z.string().optional(),
});

export const bodyAssessmentSchema = z.object({
  overall: z.string().min(1),
  estimatedBodyFat: z
    .object({
      rangeMin: z.coerce.number().min(1).max(60).nullable().optional(),
      rangeMax: z.coerce.number().min(1).max(60).nullable().optional(),
      confidence,
      caveat: z.string().default(''),
    })
    .default({ confidence: 'low' }),
  physique: z
    .object({
      summary: z.string().default(''),
      muscleBalance: stringArray,
    })
    .default({}),
  posture: z
    .array(
      z.object({
        observation: z.string().default(''),
        implication: z.string().default(''),
        confidence,
      }),
    )
    .default([]),
  goalFit: z
    .object({
      assessment: z.string().default(''),
      gaps: stringArray,
    })
    .default({}),
  priorities: stringArray,
  trainingAdjustments: stringArray,
  nutritionAdjustments: stringArray,
  progressTracking: stringArray,
  limitations: stringArray,
  disclaimer: z.string().default(''),
});

export const mealFormSchema = z.object({
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
  description: z.string().max(1000).optional().default(''),
  notes: z.string().max(2000).optional().default(''),
});

export const mealAnalysisSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        portion: z.string().default(''),
        calories: z.coerce.number().min(0).max(5000).default(0),
        proteinG: z.coerce.number().min(0).max(500).default(0),
        carbsG: z.coerce.number().min(0).max(1000).default(0),
        fatG: z.coerce.number().min(0).max(500).default(0),
        confidence,
      }),
    )
    .min(1),
  confidence,
  assumptions: stringArray,
  caveats: stringArray,
  disclaimer: z.string().default(''),
});
