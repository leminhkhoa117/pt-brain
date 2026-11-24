import { getErrorMessage } from '../api/client.js';
import { searchResearch } from '../api/summaries.js';
import {
  addSearchHistory,
  clearPendingSearch,
  saveLastSearch,
  savePendingSearch,
} from './finderHistory.js';

/**
 * Store module-level cho lượt tìm nghiên cứu.
 *
 * Request chạy trong singleton này thay vì trong mutation observer của
 * FinderPage, nên rời trang /research (unmount cả route) vẫn nhận kết quả,
 * lưu lịch sử và thông báo cho subscriber khi quay lại.
 *
 * Store là singleton toàn app, nhưng mỗi request có requestId và owner userId.
 * Khi user B đăng nhập trong lúc request của user A còn chạy, B được bắt đầu
 * lượt mới; kết quả muộn của A chỉ được ghi vào localStorage của A, không được
 * ghi đè state/UI của B.
 */

const initialState = {
  status: 'idle', // idle | pending | success | error
  payload: null,
  data: null,
  error: null,
  startedAt: 0,
  finishedAt: 0,
  userId: null,
  requestId: 0,
  version: 0,
};

const ownerKey = (userId) => String(userId || 'anon');

let state = initialState;
let nextRequestId = 0;
const listeners = new Set();

const setState = (patch) => {
  state = { ...state, ...patch, version: state.version + 1 };
  listeners.forEach((listener) => listener());
};

export function subscribeFinderStore(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFinderSnapshot() {
  return state;
}

const normalizePayload = (payload) => {
  const normalized = {
    question: String(payload?.question || '').trim(),
    filters: payload?.filters || {},
  };
  if (Array.isArray(payload?.queries) && payload.queries.length) {
    normalized.queries = payload.queries.filter(Boolean).slice(0, 4);
  }
  return normalized;
};

/**
 * Bắt đầu tìm. Trả về payload đã chuẩn hóa, hoặc null nếu chính user này đang
 * có lượt chạy (chống double-submit và tránh gọi API hai lần).
 */
export function startFinderSearch(payload, userId) {
  const owner = ownerKey(userId);
  if (state.status === 'pending' && ownerKey(state.userId) === owner) return null;

  const normalized = normalizePayload(payload);
  const startedAt = Date.now();
  const requestId = ++nextRequestId;

  // Ghi payload trước khi gọi API: nếu người dùng reload giữa chừng, FinderPage
  // khôi phục được câu hỏi/bộ lọc và hiện nút "Tiếp tục tìm".
  savePendingSearch(owner, { ...normalized, startedAt, requestId });

  setState({
    status: 'pending',
    payload: normalized,
    data: null,
    error: null,
    startedAt,
    finishedAt: 0,
    userId: owner,
    requestId,
  });

  searchResearch(normalized)
    .then((result) => {
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        question: normalized.question,
        filters: normalized.filters,
        queries: result.queries || [],
        data: result,
        saved: {},
        resultCount: result.results?.length || 0,
        savedAt: new Date().toISOString(),
      };
      // Luôn lưu vào đúng owner của request, kể cả khi user khác đã đăng nhập.
      saveLastSearch(owner, entry);
      addSearchHistory(owner, entry);
      clearPendingSearch(owner, requestId);
      if (state.requestId !== requestId) return;
      setState({
        status: 'success',
        data: result,
        error: null,
        finishedAt: Date.now(),
      });
    })
    .catch((error) => {
      clearPendingSearch(owner, requestId);
      if (state.requestId !== requestId) return;
      setState({
        status: 'error',
        data: null,
        error: getErrorMessage(error),
        finishedAt: Date.now(),
      });
    });

  return normalized;
}
