import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Icon, Portal } from '../components/ui.jsx';
import ApplyActionButton from './ApplyActionButton.jsx';
import { lessonPath } from './learningLinks.js';

export default function LessonDrawer({ lesson, surface, onClose }) {
  const navigate = useNavigate();
  const closeRef = useRef(null);
  const closeHandler = useRef(onClose);
  closeHandler.current = onClose;
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') closeHandler.current?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  if (!lesson) return null;

  const openFull = () => {
    onClose?.();
    navigate(lessonPath(lesson.slug, surface));
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-5">
        <button
          type="button"
          className="absolute inset-0 cursor-default"
          aria-label="Đóng bài học nhanh"
          onClick={onClose}
        />
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="lesson-drawer-title"
          className="relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-line bg-paper shadow-2xl dark:border-white/10 sm:rounded-2xl"
        >
          <div className="h-1 shrink-0 bg-gradient-to-r from-pine-600 via-brand-500 to-teal-400" />
          <div className="flex items-start justify-between gap-3 px-5 pt-4">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-pine-700 dark:text-pine-300">
                Học 3 phút · {lesson.minutes} phút đọc đầy đủ
              </p>
              <h2
                id="lesson-drawer-title"
                className="mt-1 font-display text-[20px] font-semibold leading-snug text-slate-900 dark:text-white"
              >
                {lesson.title}
              </h2>
              {lesson.reason && (
                <p className="mt-1 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {lesson.reason}
                </p>
              )}
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Đóng"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Mang ra phòng tập ngay
              </p>
              <ul className="mt-2 space-y-2">
                {(lesson.keyTakeaways || []).map((item, index) => (
                  <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-slate-700 dark:text-slate-200">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-pine-600 text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {(lesson.microQuiz || []).length > 0 && (
              <div className="rounded-xl border border-line bg-paper-2/50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Kiểm tra 30 giây
                </p>
                {lesson.microQuiz.map((question, index) => {
                  const chosen = answers[index];
                  const answered = chosen !== undefined;
                  return (
                    <div key={question.q} className="mt-2">
                      <p className="text-[12.5px] font-semibold text-slate-800 dark:text-slate-100">
                        {question.q}
                      </p>
                      <div className="mt-1.5 grid gap-1">
                        {question.choices.map((choice, choiceIndex) => {
                          const correct = answered && choiceIndex === question.answer;
                          const wrong = answered && choiceIndex === chosen && !correct;
                          return (
                            <button
                              key={choice}
                              type="button"
                              disabled={answered}
                              onClick={() => setAnswers((prev) => ({ ...prev, [index]: choiceIndex }))}
                              className={clsx(
                                'rounded-lg border px-2.5 py-1.5 text-left text-[12px] transition',
                                correct
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                                  : wrong
                                    ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                                    : 'border-line text-slate-600 hover:border-pine-300 dark:border-white/10 dark:text-slate-300',
                              )}
                            >
                              {choice}
                            </button>
                          );
                        })}
                      </div>
                      {answered && (
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                          {question.explain}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="rounded-xl border border-pine-200 bg-pine-50/60 p-3 dark:border-pine-900 dark:bg-pine-950/25">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-pine-700 dark:text-pine-300">
                Áp dụng vào việc đang làm
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(lesson.actions || []).map((action) => (
                  <ApplyActionButton
                    key={`${action.type}-${action.key || action.muscle || action.tab || ''}`}
                    action={action}
                    lessonSlug={lesson.slug}
                    surface={surface}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line px-5 py-3 dark:border-white/10">
            <button type="button" className="btn-ghost !px-2 !py-1 text-[12px]" onClick={onClose}>
              Để sau
            </button>
            <button type="button" className="btn-secondary !px-3 !py-1.5 text-xs" onClick={openFull}>
              Đọc bài đầy đủ
              <Icon name="arrowUpRight" className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      </div>
    </Portal>
  );
}
