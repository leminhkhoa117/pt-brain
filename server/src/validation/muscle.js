import { z } from 'zod';

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9-]{2,80}$/, 'Mã cơ không hợp lệ');

/**
 * Một schema cho cả chat cơ và chat xương/mô liên kết.
 * - kind=muscle: bắt buộc slug (server tra shared/muscles).
 * - kind=bone/connective: bắt buộc FMA id hoặc tên; server luôn ưu tiên id và
 *   tự resolve metadata, không tin tên/mô tả do client gửi.
 */
export const muscleChatSchema = z
  .object({
    kind: z.enum(['muscle', 'bone', 'connective']).optional().default('muscle'),
    slug: slugSchema.optional(),
    id: z
      .string()
      .trim()
      .regex(/^FMA\d{2,12}$/, 'Mã FMA không hợp lệ')
      .optional(),
    name: z.string().trim().max(160).optional(),
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
  .strict()
  .superRefine((data, ctx) => {
    if (data.kind === 'muscle' && !data.slug) {
      ctx.addIssue({ code: 'custom', path: ['slug'], message: 'Thiếu mã cơ' });
    }
    if (data.kind !== 'muscle' && !data.id && !data.name) {
      ctx.addIssue({
        code: 'custom',
        path: ['id'],
        message: 'Thiếu mã FMA hoặc tên cấu trúc',
      });
    }
  });

export const structureChatSchema = muscleChatSchema;
