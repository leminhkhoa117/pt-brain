/** Ngày theo giờ địa phương của người dùng, dạng YYYY-MM-DD (khớp cách server lưu dateKey). */
export function todayKey(date = new Date()) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function formatDateKey(key, withYear = false) {
  if (!key) return '—';
  const [y, m, d] = key.split('-');
  return withYear ? `${d}/${m}/${y}` : `${d}/${m}`;
}

export function formatLongDate(key) {
  if (!key) return '—';
  return new Date(`${key}T00:00:00`).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function addDaysKey(key, days) {
  const d = new Date(`${key}T00:00:00`);
  d.setDate(d.getDate() + days);
  return todayKey(d);
}

export function lastNDays(n, endKey = todayKey()) {
  return Array.from({ length: n }, (_, i) => addDaysKey(endKey, -(n - 1 - i)));
}

export function daysBetween(laterKey, earlierKey) {
  return Math.round(
    (new Date(`${laterKey}T00:00:00`) - new Date(`${earlierKey}T00:00:00`)) / 86400000,
  );
}

export function computeAge(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}
