import { z } from 'zod';

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'ID không hợp lệ');
const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có dạng YYYY-MM-DD');

const programExerciseSchema = z
  .object({
    exerciseId: objectId.optional(),
    name: z.string().trim().min(1).max(200),
    muscleGroup: z.string().trim().min(1).max(50),
    sets: z.coerce.number().int().min(1).max(20),
    repRange: z
      .object({
        min: z.coerce.number().int().min(1).max(100),
        max: z.coerce.number().int().min(1).max(100),
      })
      .default({ min: 8, max: 12 }),
    targetRir: z.coerce.number().min(0).max(5).default(2),
    restSec: z.coerce.number().min(0).max(900).default(120),
  })
  .strict();

const programDaySchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    exercises: z.array(programExerciseSchema).max(20).default([]),
  })
  .strict();

export const programCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    goal: z.enum(['cut', 'maintain', 'lean_bulk', 'bulk']).default('maintain'),
    daysPerWeek: z.coerce.number().int().min(1).max(7),
    split: z.enum(['full_body', 'upper_lower', 'ppl', 'custom']).default('custom'),
    equipment: z.array(z.string().trim().max(40)).max(20).optional().default([]),
    days: z.array(programDaySchema).max(7).default([]),
    status: z.enum(['active', 'archived']).optional().default('active'),
    deloadEveryWeeks: z.coerce.number().int().min(3).max(12).optional().default(6),
    notes: z.string().max(2000).optional().default(''),
  })
  .strict();

export const programUpdateSchema = programCreateSchema.partial();

export const suggestProgramSchema = z
  .object({
    name: z.string().trim().max(120).optional(),
    goal: z.enum(['cut', 'maintain', 'lean_bulk', 'bulk']).default('maintain'),
    experience: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
    daysPerWeek: z.coerce.number().int().min(1).max(7).default(3),
    equipment: z.array(z.string().trim().max(40)).max(20).optional().default([]),
    sessionMinutes: z.coerce.number().int().min(20).max(180).optional().default(60),
  })
  .strict();

const setSchema = z
  .object({
    exercise: z.string().trim().min(1).max(200),
    exerciseId: objectId.optional(),
    muscleGroup: z.string().trim().min(1).max(50),
    weightKg: z.coerce.number().min(0).max(1000),
    reps: z.coerce.number().int().min(0).max(200),
    rir: z.coerce.number().min(0).max(10).optional(),
    rpe: z.coerce.number().min(1).max(10).optional(),
    notes: z.string().max(300).optional().default(''),
  })
  .strict();

export const workoutCreateSchema = z
  .object({
    date: dateKey,
    programId: objectId.optional(),
    dayName: z.string().trim().max(80).optional().default(''),
    sets: z.array(setSchema).min(1, 'Cần ít nhất 1 set').max(200),
    notes: z.string().max(2000).optional().default(''),
    durationMin: z.coerce.number().min(0).max(600).optional(),
  })
  .strict();

export const workoutUpdateSchema = z
  .object({
    sets: z.array(setSchema).min(1).max(200).optional(),
    notes: z.string().max(2000).optional(),
    durationMin: z.coerce.number().min(0).max(600).optional(),
    dayName: z.string().trim().max(80).optional(),
  })
  .strict();
