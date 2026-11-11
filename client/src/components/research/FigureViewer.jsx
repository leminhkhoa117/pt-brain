import { useEffect } from 'react';
import { Icon } from '../ui.jsx';

/** Xem đúng trang PDF chứa hình/bảng, dùng PDF viewer có sẵn của trình duyệt. */
export default function FigureViewer({ src, page = 1, label = '', title = '', onClose }) {
  const pageUrl = `${src}#page=${page || 1}&zoom=page-fit&toolbar=0&navpanes=0`;

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-overlay dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5 dark:border-slate-800">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {label}
              {title ? ` · ${title}` : ''}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Trang {page || 1} · PDF gốc bạn đã tải lên
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <a
              href={pageUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost !px-2.5 !py-1.5 text-xs"
            >
              <Icon name="external" className="h-4 w-4" />
              Mở PDF
            </a>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost !px-2 !py-1.5"
              aria-label="Đóng"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        </div>
        <iframe
          title={`${label} — trang ${page || 1}`}
          src={pageUrl}
          className="min-h-0 w-full flex-1 bg-slate-100 dark:bg-slate-950"
        />
      </div>
    </div>
  );
}
