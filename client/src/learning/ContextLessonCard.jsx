import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Icon, Spinner } from '../components/ui.jsx';
import LessonDrawer from './LessonDrawer.jsx';
import { useDismissLearning, useLearningRecommendations } from './useLearning.js';

export default function ContextLessonCard({
  surface,
  context = {},
  limit = 1,
  title = 'Học nhanh cho việc đang làm',
  variant = 'card',
  className,
}) {
  const query = useLearningRecommendations({ surface, context, limit });
  const dismiss = useDismissLearning();
  const [hidden, setHidden] = useState(() => new Set());
  const [open, setOpen] = useState(null);

  const lessons = useMemo(
    () => (query.data?.recommendations || []).filter((lesson) => !hidden.has(lesson.slug)),
    [query.data, hidden],
  );

  if (query.isLoading) {
    if (variant === 'inline') return null;
    return (
      <div className={clsx('flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400', className)}>
        <Spinner className="h-4 w-4" /> Đang tìm bài phù hợp…
      </div>
    );
  }
  if (!lessons.length) return null;

  const lesson = lessons[0];

  const onDismiss = () => {
    setHidden((prev) => new Set(prev).add(lesson.slug));
    dismiss.mutate({ lessonSlug: lesson.slug, surface });
  };

  if (variant === 'inline') {
    return (
      <>
        <div
          className={clsx(
            'flex flex-wrap items-center gap-2 rounded-lg border border-pine-200/80 bg-pine-50/50 px-3 py-2 text-[12px] dark:border-pine-900/60 dark:bg-pine-950/20',
            className,
          )}
        >
          <Icon name="notebook" className="h-4 w-4 shrink-0 text-pine-700 dark:text-pine-300" />
          {title && (
            <span className="shrink-0 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-pine-700/80 dark:text-pine-300/80">
              {title}
            </span>
          )}
          <span className="min-w-0 flex-1 text-slate-700 dark:text-slate-200">
            <span className="font-semibold">{lesson.title}</span>
            <span className="text-slate-500 dark:text-slate-400"> · {lesson.reason}</span>
          </span>
          <button
            type="button"
            className="rounded-md bg-pine-700 px-2 py-1 text-[11px] font-semibold text-white hover:bg-pine-800 dark:bg-pine-500 dark:text-pine-950"
            onClick={() => setOpen(lesson)}
          >
            Học 3 phút
          </button>
          <button
            type="button"
            className="rounded-md px-1.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-white/60 dark:text-slate-400"
            onClick={onDismiss}
            aria-label="Bỏ qua gợi ý này 7 ngày"
          >
            Bỏ qua
          </button>
        </div>
        {open && <LessonDrawer lesson={open} surface={surface} onClose={() => setOpen(null)} />}
      </>
    );
  }

  return (
    <>
      <section
        className={clsx(
          'overflow-hidden rounded-xl border border-pine-200/80 bg-gradient-to-br from-pine-50/80 to-paper dark:border-pine-900/60 dark:from-pine-950/25 dark:to-surface',
          className,
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pine-200/60 px-3.5 py-2 dark:border-pine-900/50">
          <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-pine-700 dark:text-pine-300">
            <Icon name="notebook" className="h-3.5 w-3.5" />
            {title}
          </p>
          <button
            type="button"
            onClick={onDismiss}
            className="text-[10.5px] font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Bỏ qua 7 ngày
          </button>
        </div>
        <div className="px-3.5 py-3">
          <p className="text-[13.5px] font-semibold leading-snug text-slate-900 dark:text-white">
            {lesson.title}
          </p>
          <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400">
            {lesson.reason} · {lesson.minutes}′
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn-primary !px-3 !py-1.5 text-xs"
              onClick={() => setOpen(lesson)}
            >
              Học 3 phút
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {lesson.mastery > 0 ? `Mastery ${lesson.mastery}%` : 'Chưa học'}
            </span>
          </div>
        </div>
      </section>
      {open && <LessonDrawer lesson={open} surface={surface} onClose={() => setOpen(null)} />}
    </>
  );
}
