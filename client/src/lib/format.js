export function formatNumber(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(Number(value));
}

export function formatSigned(value, digits = 1, suffix = '') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  const sign = n > 0 ? '+' : '';
  return `${sign}${formatNumber(n, digits)}${suffix}`;
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export const GOAL_LABELS = {
  cut: 'Giảm mỡ',
  maintain: 'Duy trì',
  lean_bulk: 'Tăng cơ chậm',
  bulk: 'Tăng cân',
};

export const ACTIVITY_LABELS = {
  sedentary: 'Ít vận động',
  light: 'Vận động nhẹ (1-3 buổi/tuần)',
  moderate: 'Vừa (3-5 buổi/tuần)',
  very_active: 'Nhiều (6-7 buổi/tuần)',
  extra_active: 'Rất nhiều / lao động chân tay',
};

export const EXPERIENCE_LABELS = {
  beginner: 'Mới bắt đầu',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
};

export const SEX_LABELS = { male: 'Nam', female: 'Nữ' };
