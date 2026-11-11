const LAST_PREFIX = 'ptbrain.finder.last.v1.';
const HISTORY_PREFIX = 'ptbrain.finder.history.v1.';
const HISTORY_LIMIT = 8;

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
  return [];
}
