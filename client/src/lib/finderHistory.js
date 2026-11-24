const LAST_PREFIX = 'ptbrain.finder.last.v1.';
const HISTORY_PREFIX = 'ptbrain.finder.history.v1.';
const PENDING_PREFIX = 'ptbrain.finder.pending.v1.';
const DRAFT_PREFIX = 'ptbrain.finder.draft.v1.';
const HISTORY_LIMIT = 8;
// Một lượt tìm thường 20-60 giây. Giữ payload 60 phút là đủ cho người dùng
// reload/chuyển máy trong cùng buổi làm việc, nhưng không để banner "bị gián
// đoạn" từ hôm trước hiện lại và gây hiểu nhầm.
const PENDING_TTL_MS = 60 * 60 * 1000;

const keyFor = (prefix, userId) => `${prefix}${userId || 'anon'}`;

function readJson(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function persistHistory(userId, list) {
  const key = keyFor(HISTORY_PREFIX, userId);
  if (writeJson(key, list)) return;
  // Nếu vượt dung lượng localStorage, bỏ phần kết quả đã lưu và chỉ giữ metadata.
  writeJson(
    key,
    list.map(({ data: _data, ...entry }) => ({ ...entry, hasData: false })),
  );
}

export function loadLastSearch(userId) {
  return readJson(keyFor(LAST_PREFIX, userId));
}

export function saveLastSearch(userId, state) {
  if (!state) return;
  writeJson(keyFor(LAST_PREFIX, userId), state);
}

/**
 * Payload của lần tìm đang chạy. Nếu trang bị tải lại giữa lúc tìm, request
 * thật sự không thể tiếp tục — giữ payload lại để người dùng chủ động chạy lại
 * thay vì âm thầm mất câu hỏi hoặc tự động tốn thêm lượt AI.
 */
export function loadPendingSearch(userId) {
  const pending = readJson(keyFor(PENDING_PREFIX, userId));
  if (!pending?.question) return null;
  const startedAt = Number(pending.startedAt);
  const age = Date.now() - startedAt;
  // startedAt hỏng/ở tương lai xa cũng coi như dữ liệu cũ không đáng tin.
  if (!Number.isFinite(startedAt) || age > PENDING_TTL_MS || age < -5 * 60 * 1000) {
    clearPendingSearch(userId);
    return null;
  }
  return pending;
}

export function savePendingSearch(userId, state) {
  if (!state) return;
  writeJson(keyFor(PENDING_PREFIX, userId), state);
}

/**
 * Chỉ xóa pending nếu nó vẫn thuộc request đang kết thúc. Tránh trường hợp
 * request cũ của cùng user hoàn tất muộn và xóa mất pending của request mới.
 */
export function clearPendingSearch(userId, requestId) {
  try {
    const key = keyFor(PENDING_PREFIX, userId);
    if (requestId !== undefined && requestId !== null) {
      const current = readJson(key);
      if (current?.requestId && current.requestId !== requestId) return;
    }
    window.localStorage.removeItem(key);
  } catch {
    // bỏ qua
  }
}

/** Nháp câu hỏi + bộ lọc, lưu ngay cả khi chưa bấm tìm. */
export function loadFinderDraft(userId) {
  return readJson(keyFor(DRAFT_PREFIX, userId));
}

export function saveFinderDraft(userId, draft) {
  if (!draft) return;
  writeJson(keyFor(DRAFT_PREFIX, userId), draft);
}

export function clearFinderDraft(userId) {
  try {
    window.localStorage.removeItem(keyFor(DRAFT_PREFIX, userId));
  } catch {
    // bỏ qua
  }
}

export function loadSearchHistory(userId) {
  const list = readJson(keyFor(HISTORY_PREFIX, userId));
  return Array.isArray(list) ? list : [];
}

export function addSearchHistory(userId, entry) {
  const list = loadSearchHistory(userId);
  const id = entry.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const sameSearch = (item) =>
    item.question === entry.question &&
    JSON.stringify(item.filters || {}) === JSON.stringify(entry.filters || {});
  const next = [{ ...entry, id }, ...list.filter((item) => item.id !== id && !sameSearch(item))].slice(
    0,
    HISTORY_LIMIT,
  );
  persistHistory(userId, next);
  return next;
}

export function removeSearchHistory(userId, id) {
  const next = loadSearchHistory(userId).filter((item) => item.id !== id);
  persistHistory(userId, next);
  return next;
}

export function clearSearchHistory(userId) {
  try {
    window.localStorage.removeItem(keyFor(HISTORY_PREFIX, userId));
    window.localStorage.removeItem(keyFor(LAST_PREFIX, userId));
  } catch {
    // Không chặn UI nếu trình duyệt không cho xóa localStorage.
  }
  clearPendingSearch(userId);
  clearFinderDraft(userId);
  return [];
}
