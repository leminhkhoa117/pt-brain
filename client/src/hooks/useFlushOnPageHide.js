import { useEffect, useRef } from 'react';

/**
 * Gọi `flush()` khi trang sắp bị ẩn/đóng: pagehide (reload, đóng tab, vào
 * bfcache) và visibilitychange → hidden (đường đáng tin cậy trên mobile).
 *
 * Không dùng beforeunload để tránh hộp thoại chặn người dùng. Callback luôn
 * được lấy bản mới nhất qua ref, nên đổi user/key không cần gỡ/gắn listener;
 * flush bên trong vẫn phải đọc key + giá trị mới nhất từ ref của nó.
 */
export function useFlushOnPageHide(flush) {
  const flushRef = useRef(flush);
  flushRef.current = flush;

  useEffect(() => {
    const run = () => {
      try {
        flushRef.current?.();
      } catch {
        // Không được làm hỏng quá trình unload/ẩn trang.
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') run();
    };

    window.addEventListener('pagehide', run);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('pagehide', run);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);
}
