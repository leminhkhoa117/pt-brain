import { z } from 'zod';
import { dateKeySchema as dateKey } from './date.js';

export const mealPlanPreferencesSchema = z
  .object({
    mealsPerDay: z.coerce.number().int().min(3).max(5).default(3),
    dietStyle: z
      .enum(['omnivore', 'high_protein', 'vegetarian', 'vegan', 'pescatarian'])
      .default('omnivore'),
    allergies: z.array(z.string().trim().max(80)).max(20).default([]),
    dislikes: z.string().max(1000).default(''),
    budget: z.enum(['low', 'medium', 'high']).default('medium'),
    cookingMinutes: z.coerce.number().int().min(10).max(180).default(30),
    notes: z.string().max(2000).default(''),
  })
  .strict();

export const mealPlanSuggestSchema = z
  .object({
    name: z.string().trim().max(160).optional(),
    goal: z.enum(['cut', 'maintain', 'lean_bulk', 'bulk']).default('maintain'),
    startDate: dateKey,
    endDate: dateKey,
    mealsPerDay: z.coerce.number().int().min(3).max(5).default(3),
    dietStyle: z
      .enum(['omnivore', 'high_protein', 'vegetarian', 'vegan', 'pescatarian'])
      .default('omnivore'),
    allergies: z.array(z.string().trim().max(80)).max(20).default([]),
    dislikes: z.string().max(1000).default(''),
    budget: z.enum(['low', 'medium', 'high']).default('medium'),
    cookingMinutes: z.coerce.number().int().min(10).max(180).default(30),
    notes: z.string().max(2000).default(''),
  })
  .strict();

const foodSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    portion: z.string().trim().max(120).default(''),
    calories: z.coerce.number().min(0).max(3000).default(0),
    proteinG: z.coerce.number().min(0).max(500).default(0),
    carbsG: z.coerce.number().min(0).max(500).default(0),
    fatG: z.coerce.number().min(0).max(300).default(0),
  })
  .strict();

const mealSchema = z
  .object({
    type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).default('lunch'),
    name: z.string().trim().max(160).default(''),
    foods: z.array(foodSchema).min(1).max(12),
  })
  .strict();

const daySchema = z
  .object({
    label: z.string().trim().min(1).max(40),
    meals: z.array(mealSchema).min(1).max(6),
  })
  .strict();

export const mealPlanCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    goal: z.enum(['cut', 'maintain', 'lean_bulk', 'bulk']).default('maintain'),
    startDate: dateKey,
    endDate: dateKey,
    preferences: mealPlanPreferencesSchema.default({}),
    cycleDays: z.array(daySchema).length(7, 'Cần đúng 7 ngày thực đơn mẫu'),
    rationale: z.string().max(8000).default(''),
    cautions: z.array(z.string().max(500)).max(20).default([]),
    evidenceIds: z.array(z.string().max(10)).max(10).default([]),
    source: z.enum(['ai', 'fallback', 'manual']).default('ai'),
    model: z.string().max(120).default(''),
  })
  .strict();
