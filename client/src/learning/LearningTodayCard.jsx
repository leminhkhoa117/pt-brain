import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/ui.jsx';
import LessonDrawer from './LessonDrawer.jsx';
import MasteryRing from './MasteryRing.jsx';
import { useDismissLearning, useLearningNext } from './useLearning.js';

export default function LearningTodayCard() {
  const query = useLearningNext();
  const dismiss = useDismissLearning();
  const [open, setOpen] = useState(null);
  const data = query.data;

  if (query.isLoading || !data) return null;
  const lesson = data.recommendations?.[0];
  const review = data.reviewDue?.[0];

  return (
    <>
      <section className="panel overflow-hidden !p-0" aria-label="Học hôm nay">
        <div className="h-1 bg-gradient-to-r from-pine-600 via-brand-500 to-teal-400" />
        <div className="px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-pine-700 dark:text-pine-300">
                <Icon name="notebook" className="h-3.5 w-3.5" />
                Học hôm nay
              </p>
              <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
                {data.week.applies > 0
                  ? `Tuần này bạn đã áp dụng ${data.week.applies} hành động học vào app.`
                  : 'Một bài ngắn hôm nay, rồi áp dụng ngay vào việc đang làm.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <MasteryRing value={data.totals.masteryAvg} label="Mastery TB" size={48} />
              <div className="border-l border-line pl-3 text-right dark:border-white/10">
                <p className="font-mono text-[17px] font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                  {data.streakDays}
                </p>
                <p className="font-mono text-[9.5px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  ngày streak
                </p>
              </div>
            </div>
          </div>

          {lesson ? (
            <div className="mt-3 rounded-xl border border-pine-200/80 bg-pine-50/55 p-3 dark:border-pine-900/60 dark:bg-pine-950/20">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold leading-snug text-slate-900 dark:text-white">
                    {lesson.title}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-slate-500 dark:text-slate-400">
                    {lesson.reason} · {lesson.minutes}′
                  </p>
                </div>
                <span className="badge badge-pine">{lesson.status === 'reading' ? 'Đang đọc' : 'Gợi ý'}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn-primary !px-3 !py-1.5 text-xs"
                  onClick={() => setOpen(lesson)}
                >
                  Học 3 phút
                  <Icon name="arrowRight" className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="btn-ghost !px-2 !py-1 text-[11px]"
                  onClick={() => dismiss.mutate({ lessonSlug: lesson.slug, surface: 'dashboard' })}
                >
                  Bỏ qua
                </button>
                {data.continueLesson && (
                  <Link to={`/learn?lesson=${data.continueLesson.slug}`} className="text-[11px] font-semibold text-pine-700 hover:underline dark:text-pine-300">
                    Tiếp tục: {data.continueLesson.title}
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <Link to="/learn" className="btn-secondary mt-3 !px-3 !py-1.5 text-xs">
              Mở giáo trình
            </Link>
          )}

          {review && (
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Ôn tập:{' '}
              <Link to={`/learn?lesson=${review.slug}`} className="font-semibold text-pine-700 hover:underline dark:text-pine-300">
                {review.title}
              </Link>{' '}
              · quiz tốt nhất {review.quizBest}%
            </p>
          )}

          {data.week.appliedLessons?.length > 0 && (
            <div className="mt-2 border-t border-pine-200/50 pt-2 dark:border-pine-900/40">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                Đã áp dụng tuần này
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {data.week.appliedLessons.slice(0, 4).map((item) => (
                  <Link
                    key={item.slug}
                    to={`/learn?lesson=${item.slug}`}
                    className="max-w-full truncate rounded-md bg-white/60 px-2 py-0.5 text-[10.5px] font-medium text-pine-800 hover:underline dark:bg-white/[0.06] dark:text-pine-200"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      {open && <LessonDrawer lesson={open} surface="dashboard" onClose={() => setOpen(null)} />}
    </>
  );
}
