import { z } from 'zod';

const optionalMeasure = (min, max) => z.coerce.number().min(min).max(max).optional().nullable();

export const measurementsSchema = z
  .object({
    waistCm: optionalMeasure(20, 250),
    neckCm: optionalMeasure(15, 100),
    hipCm: optionalMeasure(30, 250),
    chestCm: optionalMeasure(30, 250),
    armCm: optionalMeasure(10, 100),
    thighCm: optionalMeasure(20, 150),
  })
  .strict()
  .optional();

export const postureSchema = z
  .array(
    z
      .object({
        key: z.string().min(1).max(60),
        label: z.string().max(120).optional(),
        ok: z.boolean().optional(),
        note: z.string().max(500).optional(),
      })
      .strict(),
  )
  .optional();

export const bodyLogSchema = z
  .object({
    weightKg: z.coerce.number().min(20, 'Cân nặng tối thiểu 20 kg').max(400),
    measurements: measurementsSchema,
    bodyFatPct: z.coerce.number().min(1).max(70).optional().nullable(),
    restingHr: z.coerce.number().min(25).max(150).optional().nullable(),
    sleepHours: z.coerce.number().min(0).max(24).optional().nullable(),
    steps: z.coerce.number().min(0).max(200000).optional().nullable(),
    calories: z.coerce.number().min(0).max(15000).optional().nullable(),
    proteinG: z.coerce.number().min(0).max(1000).optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
    posture: postureSchema,
  })
  .strict();

export const metricsRangeSchema = z
  .object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    days: z.coerce.number().int().min(1).max(3650).optional(),
  })
  .strict()
  .refine((q) => !(q.from && q.to) || q.from <= q.to, {
    message: 'from phải nhỏ hơn hoặc bằng to',
  });
