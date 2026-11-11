import { z } from 'zod';
import { dateKeySchema } from './date.js';

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
  })
  .strict();

export const metricsRangeSchema = z
  .object({
    from: dateKeySchema.optional(),
    to: dateKeySchema.optional(),
    days: z.coerce.number().int().min(1).max(3650).optional(),
  })
  .strict()
  .refine((q) => !(q.from && q.to) || q.from <= q.to, {
    message: 'from phải nhỏ hơn hoặc bằng to',
  });
