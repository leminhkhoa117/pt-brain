import { z } from 'zod';

export const muscleChatSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9-]{2,80}$/, 'Mã cơ không hợp lệ'),
    message: z.string().trim().min(2, 'Câu hỏi quá ngắn').max(1500, 'Câu hỏi tối đa 1.500 ký tự'),
    history: z
      .array(
        z
          .object({
            role: z.enum(['user', 'assistant']),
            content: z.string().max(3000),
          })
          .strict(),
      )
      .max(10)
      .default([]),
  })
  .strict();
