import { z } from 'zod';

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'ID không hợp lệ');

export const flashcardCreateSchema = z
  .object({
    termId: objectId.optional(),
    front: z.string().trim().min(1).max(2000).optional(),
    back: z.string().trim().min(1).max(4000).optional(),
    sourcePaperId: objectId.optional(),
  })
  .strict()
  .refine((data) => data.termId || (data.front && data.back), {
    message: 'Cần termId hoặc đủ front/back',
  });

export const flashcardUpdateSchema = z
  .object({
    front: z.string().trim().min(1).max(2000).optional(),
    back: z.string().trim().min(1).max(4000).optional(),
  })
  .strict();

export const reviewSchema = z.object({
  quality: z.coerce.number().int().min(0).max(5),
});

export const termUpdateSchema = z
  .object({
    en: z.string().trim().min(1).max(200).optional(),
    vi: z.string().trim().min(1).max(200).optional(),
    explanation: z.string().trim().max(2000).optional(),
    example: z.string().trim().max(2000).optional(),
  })
  .strict();

export const noteUpdateSchema = z
  .object({
    text: z.string().trim().min(1).max(10000).optional(),
    tags: z.array(z.string().trim().max(50)).max(20).optional(),
  })
  .strict();

export const applyPlanSchema = z.object({
  programId: objectId,
});

const planChangeSchema = z.object({
  dayName: z.string().trim().min(1).max(80),
  exerciseName: z.string().trim().min(1).max(200),
  field: z.enum(['sets', 'targetRir', 'repMin', 'repMax']),
  after: z.coerce.number(),
});

export const applyChangesSchema = z.object({
  changes: z.array(planChangeSchema).min(1).max(20),
});

export const planProposalSchema = z.object({
  rationale: z.string().default(''),
  changes: z
    .array(
      z.object({
        dayName: z.string(),
        exerciseName: z.string(),
        field: z.enum(['sets', 'targetRir', 'repMin', 'repMax']),
        after: z.coerce.number(),
        reason: z.string().default(''),
      }),
    )
    .default([]),
  noChangeReason: z.string().default(''),
});
