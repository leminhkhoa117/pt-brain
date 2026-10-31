import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email không hợp lệ'),
  password: z
    .string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .max(100, 'Mật khẩu tối đa 100 ký tự'),
  name: z.string().trim().min(2, 'Tên tối thiểu 2 ký tự').max(80),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const profileSchema = z
  .object({
    sex: z.enum(['male', 'female']).optional(),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh phải có dạng YYYY-MM-DD')
      .optional()
      .or(z.literal('').transform(() => undefined)),
    heightCm: z.coerce.number().min(100).max(250).optional(),
    activityLevel: z
      .enum(['sedentary', 'light', 'moderate', 'very_active', 'extra_active'])
      .optional(),
    goal: z.enum(['cut', 'maintain', 'lean_bulk', 'bulk']).optional(),
    experience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    units: z.enum(['metric', 'imperial']).optional(),
  })
  .strict();

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    profile: profileSchema.optional(),
  })
  .strict()
  .refine((data) => data.name !== undefined || data.profile !== undefined, {
    message: 'Không có dữ liệu cần cập nhật',
  });
