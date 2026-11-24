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

/** Hiển thị DOI giữ chữ hoa mã publisher: 10.1519/jsc... -> 10.1519/JSC... */
export function formatDoi(value = '') {
  const doi = String(value)
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '');
  const match = doi.match(/^(10\.\d{4,9}\/)([a-z]{2,8})(\.[-._;()/:a-z0-9]+)$/i);
  if (!match) return doi;
  return `${match[1]}${match[2].toUpperCase()}${match[3]}`;
}

/**
 * Bỏ markup HTML trong text lấy từ nguồn ngoài (Europe PMC trả abstract dạng
 * `<h4>Objective</h4>...`). Không render HTML để tránh XSS, chỉ lấy text thuần
 * và giữ xuống dòng giữa các mục.
 */
export function htmlToPlainText(value = '') {
  const text = String(value || '');
  const hasMarkup = /<[a-z][^>]*>/i.test(text);
  const hasEntity = /&(?:[a-z]+|#\d+|#x[0-9a-f]+);/i.test(text);
  if (!hasMarkup && !hasEntity) return text;

  const doc = new DOMParser().parseFromString(text, 'text/html');
  doc.querySelectorAll('script, style, noscript, svg, iframe').forEach((el) => el.remove());
  doc.querySelectorAll('br').forEach((el) => el.replaceWith('\n'));
  doc
    .querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li, tr, blockquote')
    .forEach((el) => el.append('\n'));

  return (doc.body.textContent || '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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
