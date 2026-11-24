import { useEffect, useRef, useState } from 'react';
import { readStored, writeStored } from '../lib/persist.js';
import { useFlushOnPageHide } from './useFlushOnPageHide.js';

const readValue = (key, fallback) => {
  if (!key) return fallback;
  const stored = readStored(key);
  return stored === null || stored === undefined ? fallback : stored;
};

/**
 * useState nhưng tự khôi phục/lưu vào localStorage theo key.
 *
 * - Key đổi (ví dụ đăng nhập xong, userId khác) thì đọc lại state của key mới,
 *   không ghi đè state cũ sang key mới.
 * - delay > 0 để debounce ô nhập liệu, tránh ghi localStorage mỗi phím.
 * - Khi unmount, pagehide hoặc tab bị ẩn (mobile) mà còn thay đổi chưa kịp
 *   ghi thì flush ngay, để reload/đóng tab không mất draft.
 */
export function usePersistentState(key, initialValue, { delay = 0 } = {}) {
  const initialRef = useRef(initialValue);
  const [state, setState] = useState(() => readValue(key, initialRef.current));
  const keyRef = useRef(key);
  const stateRef = useRef(state);
  const dirtyRef = useRef(false);
  stateRef.current = state;

  // Đổi key: đọc ngay trong render để commit đầu tiên với key mới đã dùng
  // đúng state, không ghi nhầm state của user cũ.
  if (keyRef.current !== key) {
    keyRef.current = key;
    const next = readValue(key, initialRef.current);
    stateRef.current = next;
    setState(next);
    dirtyRef.current = false;
  }

  useEffect(() => {
    if (!key) return undefined;
    dirtyRef.current = true;
    if (!delay) {
      writeStored(key, state);
      dirtyRef.current = false;
      return undefined;
    }
    const timer = setTimeout(() => {
      // Key có thể đã đổi trong lúc chờ debounce.
      if (keyRef.current !== key) return;
      dirtyRef.current = false;
      writeStored(key, stateRef.current);
    }, delay);
    return () => clearTimeout(timer);
  }, [key, state, delay]);

  // Dùng ref để pagehide/unmount luôn đọc key + giá trị mới nhất.
  const flushRef = useRef(null);
  if (!flushRef.current) {
    flushRef.current = () => {
      if (!dirtyRef.current) return;
      dirtyRef.current = false;
      if (keyRef.current) writeStored(keyRef.current, stateRef.current);
    };
  }

  useFlushOnPageHide(flushRef.current);

  // Flush phần còn nợ khi unmount (kể cả chuyển route ngay sau khi gõ).
  useEffect(() => () => flushRef.current(), []);

  return [state, setState];
}
