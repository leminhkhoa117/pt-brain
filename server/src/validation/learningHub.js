import { z } from 'zod';
import {
  LEARNING_ACTION_TYPES,
  LEARNING_SURFACES,
} from '../../../shared/learning/contexts.js';

const surfaceSchema = z.enum(Object.keys(LEARNING_SURFACES));
const actionTypeSchema = z.enum(Object.keys(LEARNING_ACTION_TYPES));

export const recommendationsQuerySchema = z
  .object({
    surface: surfaceSchema.default('dashboard'),
    goal: z.enum(['cut', 'maintain', 'lean_bulk', 'bulk']).optional(),
    experience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    conditions: z.string().trim().max(300).optional(),
    muscles: z.string().trim().max(600).optional(),
    exercises: z.string().trim().max(600).optional(),
    calculator: z.string().trim().max(60).optional(),
    anatomyGroup: z.string().trim().max(60).optional(),
    region: z.string().trim().max(60).optional(),
    query: z.string().trim().max(200).optional(),
    limit: z.coerce.number().int().min(1).max(6).default(3),
  })
  .strict();

export const applyActionSchema = z
  .object({
    actionType: actionTypeSchema,
    label: z.string().trim().max(200).optional().default(''),
    surface: z.string().trim().max(60).optional().default(''),
    payload: z.record(z.string(), z.any()).optional(),
  })
  .strict();

export const dismissSchema = z
  .object({
    lessonSlug: z.string().trim().regex(/^[a-z]+-\d+-\d+$/, 'Slug bài học không hợp lệ'),
    surface: surfaceSchema,
  })
  .strict();

export const trackEventSchema = z
  .object({
    type: z.enum(['recommend_click']),
    lessonSlug: z.string().trim().regex(/^[a-z]+-\d+-\d+$/, 'Slug bài học không hợp lệ'),
    surface: surfaceSchema,
  })
  .strict();
