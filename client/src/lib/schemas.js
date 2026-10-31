import { z } from 'zod';

const optNumber = (min, max, message) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number({ invalid_type_error: message }).min(min, message).max(max, message).optional(),
  );

export const bodyLogSchema = z.object({
  weightKg: z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z
      .number({ required_error: 'Cân nặng là bắt buộc', invalid_type_error: 'Cân nặng phải là số' })
      .min(20, 'Cân nặng tối thiểu 20 kg')
      .max(400, 'Cân nặng tối đa 400 kg'),
  ),
  waistCm: optNumber(20, 250, 'Vòng bụng 20-250 cm'),
  neckCm: optNumber(15, 100, 'Vòng cổ 15-100 cm'),
  hipCm: optNumber(30, 250, 'Vòng mông 30-250 cm'),
  chestCm: optNumber(30, 250, 'Vòng ngực 30-250 cm'),
  armCm: optNumber(10, 100, 'Vòng tay 10-100 cm'),
  thighCm: optNumber(20, 150, 'Vòng đùi 20-150 cm'),
  bodyFatPct: optNumber(1, 70, '% mỡ 1-70'),
  restingHr: optNumber(25, 150, 'Nhịp tim nghỉ 25-150'),
  sleepHours: optNumber(0, 24, 'Giấc ngủ 0-24 giờ'),
  steps: optNumber(0, 200000, 'Số bước 0-200.000'),
  calories: optNumber(0, 15000, 'Calo 0-15.000'),
  proteinG: optNumber(0, 1000, 'Protein 0-1.000 g'),
  notes: z.string().max(2000, 'Ghi chú tối đa 2.000 ký tự').optional(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Tên tối thiểu 2 ký tự').max(80),
  sex: z.enum(['male', 'female']).optional().or(z.literal('')),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh phải có dạng YYYY-MM-DD')
    .optional()
    .or(z.literal('')),
  heightCm: optNumber(100, 250, 'Chiều cao 100-250 cm'),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'very_active', 'extra_active']),
  goal: z.enum(['cut', 'maintain', 'lean_bulk', 'bulk']),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
});

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Tên tối thiểu 2 ký tự').max(80),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự').max(100),
});
