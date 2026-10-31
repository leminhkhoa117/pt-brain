import { z } from 'zod';

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'ID không hợp lệ');

export const clientCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email('Email không hợp lệ').optional().or(z.literal('')),
    phone: z.string().trim().max(30).optional().default(''),
    sex: z.enum(['male', 'female']).optional(),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh phải có dạng YYYY-MM-DD')
      .optional()
      .or(z.literal('')),
    heightCm: z.coerce.number().min(100).max(250).optional(),
    goal: z.enum(['cut', 'maintain', 'lean_bulk', 'bulk']).optional().default('maintain'),
    experience: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('beginner'),
    status: z.enum(['active', 'paused', 'ended']).optional().default('active'),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    programId: objectId.optional().or(z.literal('')),
    notes: z.string().max(4000).optional().default(''),
    tags: z.array(z.string().trim().max(50)).max(20).optional().default([]),
    lastCheckIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })
  .strict();

export const clientUpdateSchema = clientCreateSchema.partial();
