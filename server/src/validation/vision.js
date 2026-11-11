import { z } from 'zod';
import { dateKeySchema } from './date.js';

export const mealListQuerySchema = z
  .object({
    date: dateKeySchema.optional(),
    from: dateKeySchema.optional(),
    to: dateKeySchema.optional(),
  })
  .strict()
  .refine((query) => !(query.from && query.to) || query.from <= query.to, {
    message: 'from phải nhỏ hơn hoặc bằng to',
  });

export const mealSummaryQuerySchema = z
  .object({
    date: dateKeySchema.optional(),
  })
  .strict();

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
  dateKey: dateKeySchema.optional(),
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
  dateKey: dateKeySchema.optional(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
  description: z.string().max(1000).optional().default(''),
  notes: z.string().max(2000).optional().default(''),
});

// Người dùng chỉ nhập tên món + khối lượng, AI ước tính calo/macro.
export const mealEstimateSchema = z
  .object({
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).default('lunch'),
    description: z.string().trim().max(1000).optional().default(''),
    notes: z.string().trim().max(2000).optional().default(''),
    items: z
      .array(
        z
          .object({
            name: z.string().trim().min(1, 'Tên món không được để trống').max(160),
            grams: z.coerce
              .number()
              .min(1, 'Khối lượng tối thiểu 1 g')
              .max(5000, 'Khối lượng tối đa 5.000 g'),
          })
          .strict(),
      )
      .min(1, 'Cần ít nhất 1 món')
      .max(20, 'Tối đa 20 món mỗi lần ước tính'),
  })
  .strict();

const mealItemSchema = z
  .object({
    name: z.string().trim().min(1, 'Tên món không được để trống').max(160),
    portion: z.string().trim().max(120).default(''),
    calories: z.coerce.number().min(0).max(5000).default(0),
    proteinG: z.coerce.number().min(0).max(500).default(0),
    carbsG: z.coerce.number().min(0).max(1000).default(0),
    fatG: z.coerce.number().min(0).max(500).default(0),
  })
  .strict();

export const manualMealSchema = z
  .object({
    dateKey: dateKeySchema.optional(),
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).default('lunch'),
    description: z.string().max(1000).optional().default(''),
    notes: z.string().max(2000).optional().default(''),
    // 'ai' = số do AI ước tính (người dùng có thể đã sửa), 'manual' = tự nhập hoàn toàn.
    source: z.enum(['ai', 'manual']).default('manual'),
    confidence: z.enum(['low', 'medium', 'high']).optional(),
    assumptions: z.array(z.string().trim().max(300)).max(10).optional(),
    items: z.array(mealItemSchema).min(1, 'Cần ít nhất 1 món').max(30),
  })
  .strict();

export const manualMealUpdateSchema = manualMealSchema
  .partial()
  .extend({ items: z.array(mealItemSchema).min(1).max(30).optional() })
  .strict();

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
