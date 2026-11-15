/**
 * Lưu nhẹ trạng thái UI vào localStorage để điều hướng qua trang khác rồi quay
 * lại không mất ngữ cảnh (bài đang đọc, cơ đang xem, lịch sử chat...).
 * Mọi lỗi (chế độ riêng tư, quota, JSON hỏng) đều bị nuốt để UI không sập.
 */
export function readStored(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStored(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Không lưu được thì thôi, UI vẫn chạy bình thường.
  }
}

export function removeStored(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // bỏ qua
  }
}
