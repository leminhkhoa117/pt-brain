import { ApiError } from './ApiError.js';

export const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Chuyển Date/chuỗi ISO thành 'YYYY-MM-DD' theo UTC. */
export function toDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw ApiError.badRequest('Ngày không hợp lệ');
  return date.toISOString().slice(0, 10);
}

/** Parse 'YYYY-MM-DD' thành Date UTC 00:00. Ném 400 nếu sai định dạng / ngày không tồn tại. */
export function parseDateKey(key) {
  if (typeof key !== 'string' || !DATE_KEY_PATTERN.test(key)) {
    throw ApiError.badRequest('Ngày phải có định dạng YYYY-MM-DD');
  }
  const date = new Date(`${key}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || toDateKey(date) !== key) {
    throw ApiError.badRequest('Ngày không tồn tại');
  }
  return date;
}

/** Ngày hôm nay theo múi giờ Việt Nam (UTC+7) dạng YYYY-MM-DD. */
export function todayKeyVN(now = new Date()) {
  return new Date(now.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10);
}

export function addDaysKey(key, days) {
  const date = parseDateKey(key);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateKey(date);
}
