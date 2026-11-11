import { z } from 'zod';
import { HEALTH_CONDITION_KEYS } from '../../../shared/health/conditions.js';

const MIN_AGE = 14;
const MAX_AGE = 100;

/** Tuổi theo UTC; dùng cùng quy tắc với User.age() để tránh lệch múi giờ. */
function ageFromBirthDate(value) {
  const birth = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let years = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - birth.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < birth.getUTCDate())) years -= 1;
  return years;
}

const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh phải có dạng YYYY-MM-DD')
  .refine((value) => {
    const age = ageFromBirthDate(value);
    return age !== null && age >= MIN_AGE && age <= MAX_AGE;
  }, `Ngày sinh phải cho tuổi từ ${MIN_AGE} đến ${MAX_AGE}`);

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
    birthDate: birthDateSchema
      .optional()
      .or(z.literal('').transform(() => undefined)),
    heightCm: z.coerce.number().min(100).max(250).optional(),
    weightKg: z.coerce.number().min(20).max(400).optional(),
    activityLevel: z
      .enum(['sedentary', 'light', 'moderate', 'very_active', 'extra_active'])
      .optional(),
    goal: z.enum(['cut', 'maintain', 'lean_bulk', 'bulk']).optional(),
    experience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    units: z.enum(['metric', 'imperial']).optional(),
    healthConditions: z.array(z.enum(HEALTH_CONDITION_KEYS)).max(10).optional(),
    conditionNotes: z.string().trim().max(1000).optional(),
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
