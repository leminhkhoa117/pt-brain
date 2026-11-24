/**
 * Chính sách mật khẩu dùng chung cho client và server.
 * Mục tiêu: đủ mạnh để chống đoán/dò, nhưng vẫn dễ nhập trên điện thoại.
 * Không bắt ký tự đặc biệt bắt buộc — độ dài + không nằm trong danh sách phổ biến
 * có tác dụng thực tế cao hơn.
 */

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 100;

// Các mật khẩu bị dò đầu tiên trong mọi vụ credential stuffing.
// Danh sách ngắn, chỉ để chặn lựa chọn tệ nhất; không thay thế kiểm tra breach online.
const COMMON_PASSWORDS = new Set([
  '123456789',
  '1234567890',
  '12345678',
  '123456789a',
  'password',
  'password1',
  'password12',
  'password123',
  'password1234',
  'matkhau123',
  'matkhau1234',
  'qwerty123',
  'qwertyuiop',
  'abc123456',
  'iloveyou',
  'admin123',
  'welcome1',
  'letmein123',
  'monkey123',
  'dragon123',
  'sunshine1',
  'princess1',
  'football1',
  'baseball1',
  'trustno1',
]);

/**
 * Trả về danh sách lỗi (rỗng = hợp lệ).
 * @param {string} value
 * @param {{ email?: string, name?: string }} [context]
 */
export function passwordProblems(value, { email = '', name = '' } = {}) {
  const password = String(value ?? '');
  const problems = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    problems.push(`Mật khẩu tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`);
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    problems.push(`Mật khẩu tối đa ${PASSWORD_MAX_LENGTH} ký tự`);
  }
  if (password && !/[A-Za-zÀ-ỹ]/.test(password)) {
    problems.push('Mật khẩu cần có ít nhất một chữ cái');
  }
  if (password && !/\d/.test(password)) {
    problems.push('Mật khẩu cần có ít nhất một chữ số');
  }

  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) {
    problems.push('Mật khẩu này quá phổ biến, hãy chọn mật khẩu khác');
  }

  const localPart = String(email || '').split('@')[0].trim().toLowerCase();
  if (localPart.length >= 3 && lower.includes(localPart)) {
    problems.push('Mật khẩu không nên chứa phần tên email của bạn');
  }
  const normalizedName = String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
  if (normalizedName.length >= 4 && lower.replace(/\s+/g, '').includes(normalizedName)) {
    problems.push('Mật khẩu không nên chứa họ tên của bạn');
  }

  return problems;
}

export function isStrongPassword(value, context) {
  return passwordProblems(value, context).length === 0;
}

/** Ước lượng độ mạnh 0–4 để vẽ thanh gợi ý trong UI. */
export function passwordStrength(value, context) {
  const password = String(value ?? '');
  if (!password) return { score: 0, label: 'Chưa nhập' };
  let score = 0;
  if (password.length >= PASSWORD_MIN_LENGTH) score += 1;
  if (password.length >= 14) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  if (passwordProblems(password, context).length > 0) score = Math.min(score, 1);
  const labels = ['Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'];
  return { score: Math.min(score, 4), label: labels[Math.min(score, 4)] };
}
