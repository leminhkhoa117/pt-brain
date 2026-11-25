import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { MUSCLES } from '@shared/muscles/index.js';
import { Icon } from './ui.jsx';
import HumanAtlasExplorer from '../pages/atlas/HumanAtlasExplorer.jsx';

export default function MuscleAtlasModal({ slug, onClose }) {
  const muscle = slug ? MUSCLES[slug] : null;

  useEffect(() => {
    if (!muscle) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [muscle, onClose]);

  if (!muscle) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Mô hình 3D ${muscle.vi}`}
        className="flex h-[min(92dvh,820px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-2xl dark:border-white/10"
      >
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3 dark:border-white/10 sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Human Atlas 3D
            </p>
            <h2 className="mt-0.5 truncate text-base font-bold text-slate-900 dark:text-white">
              {muscle.vi}{' '}
              <span className="font-normal text-slate-500 dark:text-slate-400">({muscle.en})</span>
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              Đang focus vào nhóm cơ này · kéo để xoay · cuộn để zoom
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to={`/muscles?muscle=${encodeURIComponent(slug)}`}
              className="btn-secondary !px-3 !py-1.5 text-xs"
            >
              <Icon name="external" className="h-3.5 w-3.5" />
              Mở trang đầy đủ
            </Link>
            <button
              type="button"
              onClick={onClose}
              autoFocus
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Đóng mô hình 3D"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="relative min-h-0 flex-1">
          <HumanAtlasExplorer compact initialSlug={slug} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
