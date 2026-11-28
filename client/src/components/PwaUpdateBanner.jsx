import { useEffect, useState } from 'react';
import { Icon } from './ui.jsx';

/**
 * Khi service worker mới chiếm quyền điều khiển trang, JS đang chạy vẫn là bản
 * cũ. Hiện banner để người dùng chủ động tải lại thay vì phải đóng/mở app.
 */
export default function PwaUpdateBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return undefined;
    // Lần cài đặt đầu tiên chưa có controller; tránh hiện banner ngay.
    if (!navigator.serviceWorker.controller) return undefined;

    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      setVisible(true);
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-[60] mx-auto flex w-[calc(100%-2rem)] max-w-md items-center gap-3 rounded-lg border border-line bg-surface px-3.5 py-3 shadow-overlay dark:border-white/10">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pine-50 text-pine-700 dark:bg-pine-950/50 dark:text-pine-300">
        <Icon name="download" className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-semibold text-slate-800 dark:text-slate-100">
          Đã có bản mới
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Tải lại để dùng phiên bản mới nhất.
        </p>
      </div>
      <button
        type="button"
        className="btn-primary btn-sm shrink-0"
        onClick={() => window.location.reload()}
      >
        Tải lại
      </button>
    </div>
  );
}
