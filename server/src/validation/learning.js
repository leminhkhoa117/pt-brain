import { z } from 'zod';

const objectId = z.string().trim().regex(/^[a-f0-9]{24}$/i, 'ID không hợp lệ');

const changeSchema = z
  .object({
    dayName: z.string().trim().min(1).max(120),
    exerciseName: z.string().trim().min(1).max(160),
    field: z.enum(['sets', 'targetRir', 'repMin', 'repMax']),
    after: z.coerce.number().finite(),
    reason: z.string().trim().max(600).optional().default(''),
  })
  .strict();

export const applyChangesSchema = z
  .object({
    changes: z.array(changeSchema).min(1).max(40),
  })
  .strict();

export const planProposalSchema = z
  .object({
    rationale: z.string().trim().max(3000).optional().default(''),
    changes: z.array(changeSchema).max(40).optional().default([]),
    noChangeReason: z.string().trim().max(1000).optional().default(''),
  })
  .strict();

export const applyPlanSchema = z
  .object({
    programId: objectId,
  })
  .strict();

export const flashcardCreateSchema = z
  .object({
    termId: objectId.optional(),
    front: z.string().trim().min(1).max(1000).optional(),
    back: z.string().trim().min(1).max(5000).optional(),
    sourcePaperId: objectId.optional(),
  })
  .strict()
  .refine((data) => data.termId || (data.front && data.back), {
    message: 'Cần termId hoặc đủ front/back',
  });

export const flashcardUpdateSchema = z
  .object({
    front: z.string().trim().min(1).max(1000).optional(),
    back: z.string().trim().min(1).max(5000).optional(),
    sourcePaperId: objectId.nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, { message: 'Không có dữ liệu cần cập nhật' });

export const reviewSchema = z
  .object({
    quality: z.coerce.number().int().min(0).max(5),
  })
  .strict();

export const termUpdateSchema = z
  .object({
    en: z.string().trim().min(1).max(200).optional(),
    vi: z.string().trim().min(1).max(200).optional(),
    explanation: z.string().trim().max(2000).optional(),
    example: z.string().trim().max(2000).optional(),
    tags: z.array(z.string().trim().max(50)).max(20).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, { message: 'Không có dữ liệu cần cập nhật' });

export const noteUpdateSchema = z
  .object({
    text: z.string().trim().min(1).max(10000).optional(),
    tags: z.array(z.string().trim().max(50)).max(20).optional(),
    appliedToProgramId: objectId.nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, { message: 'Không có dữ liệu cần cập nhật' });
