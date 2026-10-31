import { z } from 'zod';

export const quizRequestSchema = z
  .object({
    summaryId: z.string().regex(/^[a-f0-9]{24}$/i, 'ID không hợp lệ'),
    count: z.coerce.number().int().min(3).max(10).optional().default(5),
  })
  .strict();
