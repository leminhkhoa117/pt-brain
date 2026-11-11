import { z } from 'zod';

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Không chỉ đúng định dạng mà còn phải là ngày có thật (chặn 2026-99-99). */
export function isValidDateKey(value) {
  if (typeof value !== 'string' || !DATE_KEY_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const dateKeySchema = z
  .string()
  .regex(DATE_KEY_PATTERN, 'Ngày phải có dạng YYYY-MM-DD')
  .refine(isValidDateKey, 'Ngày không tồn tại');
