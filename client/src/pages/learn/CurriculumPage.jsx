import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { Alert, Icon, LoadingBlock, PageHeader, Stat } from '../../components/ui.jsx';
import { getCurriculum } from '../../api/curriculum.js';
import { getErrorMessage } from '../../api/client.js';

const MODULE_ICONS = {
  anat: 'body',
  phys: 'activity',
  nutr: 'utensils',
  fit: 'target',
  rehab: 'checkCircle',
  case: 'notebook',
};

/** Bar chạy từ 0 tới giá trị sau khi mount — một "nhịp sống" nhỏ, tôn trọng reduced-motion. */
function ProgressBar({ percent, className, thick = false }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={clsx(
        'w-full overflow-hidden rounded-full bg-line/80 dark:bg-white/[0.09]',
        thick ? 'h-1.5' : 'h-1',
        className,
      )}
      role="progressbar"
      aria-valuenow={percent}
      aria-label={`Tiến độ ${percent}%`}
    >
      <div
        className="h-full rounded-full bg-pine-600 transition-[width] duration-700 ease-out motion-reduce:transition-none dark:bg-pine-400"
        style={{ width: mounted ? `${percent}%` : '0%' }}
      />
    </div>
  );
}

function LessonStatus({ status }) {
  if (status === 'completed') {
    return (
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[4px] bg-pine-600 text-white dark:bg-pine-500">
        <Icon name="checkCircle" className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (status === 'reading') {
    return (
      <span className="relative grid h-5 w-5 shrink-0 place-items-center rounded-[4px] border border-pine-500 dark:border-pine-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pine-600 motion-reduce:animate-none dark:bg-pine-300" />
      </span>
    );
  }
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[4px] border border-line dark:border-white/15" />
  );
}

function LessonRow({ lesson, onSelectLesson }) {
  return (
    <button
      type="button"
      onClick={() => onSelectLesson(lesson.slug)}
      className={clsx(
        'group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors',
        'hover:bg-paper-2 focus-visible:bg-paper-2 dark:hover:bg-white/[0.05] dark:focus-visible:bg-white/[0.05]',
      )}
    >
      <LessonStatus status={lesson.status} />
      <span
        className={clsx(
          'min-w-0 flex-1 truncate text-[13px]',
          lesson.status === 'completed'
            ? 'font-medium text-slate-500 dark:text-slate-400'
            : 'font-medium text-slate-700 group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white',
        )}
      >
        {lesson.title}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {lesson.quizBest > 0 && (
          <span className="rounded bg-paper-2 px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-slate-500 dark:bg-white/[0.06] dark:text-slate-300">
            {lesson.quizBest}%
          </span>
        )}
        <span className="font-mono text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
          {lesson.minutes}′
        </span>
        <Icon
          name="chevronRight"
          className="h-3.5 w-3.5 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-600"
        />
      </span>
    </button>
  );
}

function ModuleSection({ mod, index, onSelectLesson }) {
  const percent = mod.lessonCount ? Math.round((mod.completed / mod.lessonCount) * 100) : 0;
  const done = mod.lessonCount > 0 && mod.completed === mod.lessonCount;

  return (
    <section id={`module-${mod.key}`} className="panel overflow-hidden !p-0">
      {/* Header module: số serif lớn + tên + bộ đếm — nhịp đọc của cả trang */}
      <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
        <span
          className={clsx(
            'font-display text-[30px] font-semibold leading-none tracking-tight',
            done ? 'text-pine-600 dark:text-pine-300' : 'text-slate-300 dark:text-slate-600',
          )}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-pine-600/10 text-pine-700 dark:bg-pine-400/10 dark:text-pine-300">
          <Icon name={MODULE_ICONS[mod.key] || 'book'} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
            <h2 className="font-display text-[18px] font-semibold leading-tight text-slate-900 dark:text-white">
              {mod.vi}
            </h2>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
              {mod.en}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-slate-500 dark:text-slate-400">
            {mod.blurb}
          </p>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <p className="font-mono text-[15px] font-semibold tabular-nums text-slate-700 dark:text-slate-200">
            {mod.completed}
            <span className="text-slate-400 dark:text-slate-500">/{mod.lessonCount}</span>
          </p>
          <p className="font-mono text-[10.5px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {mod.minutesTotal}′ đọc
          </p>
        </div>
      </div>

      <div className="px-5 pb-4 sm:px-6">
        <ProgressBar percent={percent} thick />
        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-mono text-[10.5px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {done ? 'Module hoàn thành' : `${percent}%`}
          </span>
          <span className="font-mono text-[10.5px] tabular-nums text-slate-400 sm:hidden dark:text-slate-500">
            {mod.completed}/{mod.lessonCount} bài
          </span>
        </div>
      </div>

      {/* Chương: lưới ô kẻ hairline như trang giáo trình in */}
      <div className="grid gap-px border-t border-line bg-line sm:grid-cols-2 dark:border-white/[0.08] dark:bg-white/[0.08]">
        {mod.chapters.map((chapter) => (
          <div
            key={`${mod.key}-${chapter.no}`}
            className="bg-surface p-3 dark:bg-[#151b18] sm:p-4"
          >
            <p className="px-2.5 pb-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
              Chương {chapter.no} · {chapter.title}
            </p>
            <div className="flex flex-col">
              {chapter.lessons.map((lesson) => (
                <LessonRow
                  key={lesson.slug}
                  lesson={lesson}
                  onSelectLesson={onSelectLesson}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CurriculumPage({ onSelectLesson }) {
  const curriculumQuery = useQuery({
    queryKey: ['curriculum'],
    queryFn: getCurriculum,
  });

  const data = curriculumQuery.data;

  const stats = useMemo(() => {
    if (!data?.modules) return null;
    const allLessons = data.modules.flatMap((m) => m.chapters.flatMap((c) => c.lessons));
    const minutesDone = allLessons
      .filter((l) => l.status !== 'new')
      .reduce((sum, l) => sum + l.minutes, 0);
    const minutesTotal = data.modules.reduce((sum, m) => sum + m.minutesTotal, 0);
    const quizzed = allLessons.filter((l) => l.quizBest > 0);
    const quizAvg = quizzed.length
      ? Math.round(quizzed.reduce((sum, l) => sum + l.quizBest, 0) / quizzed.length)
      : null;
    const modulesDone = data.modules.filter(
      (m) => m.lessonCount > 0 && m.completed === m.lessonCount,
    ).length;
    return { minutesDone, minutesTotal, quizAvg, quizzedCount: quizzed.length, modulesDone };
  }, [data]);

  const continueLesson = useMemo(() => {
    if (!data?.continueLesson) return null;
    for (const mod of data.modules) {
      for (const chapter of mod.chapters) {
        const found = chapter.lessons.find((l) => l.slug === data.continueLesson);
        if (found) return { lesson: found, module: mod };
      }
    }
    return null;
  }, [data]);

  if (curriculumQuery.isLoading) {
    return <LoadingBlock label="Đang tải giáo trình..." />;
  }

  if (curriculumQuery.isError) {
    return <Alert tone="danger">{getErrorMessage(curriculumQuery.error)}</Alert>;
  }

  const { modules, overall } = data;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Giáo trình PT"
        subtitle={`${modules.length} module · ${overall.totalLessons} bài — từ giải phẫu, sinh lý, dinh dưỡng, thể chất, phục hồi tới ca ứng dụng cá nhân hoá.`}
      />

      {/* Signature: dải đo lường kẻ ô — tiến độ học tập */}
      <section className="panel overflow-hidden !p-0" aria-label="Tiến độ học tập">
        <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4 dark:bg-white/[0.08]">
          <div className="border-t-2 border-t-pine-600 bg-surface dark:border-t-pine-400 dark:bg-[#151b18]">
            <Stat
              label="Bài hoàn thành"
              value={String(overall.completed)}
              unit={`/ ${overall.totalLessons}`}
              hint={`${overall.percent}% toàn giáo trình`}
              icon="checkCircle"
            />
          </div>
          <div className="bg-surface dark:bg-[#151b18]">
            <Stat
              label="Phút đã học"
              value={String(stats.minutesDone)}
              unit={`/ ${stats.minutesTotal}′`}
              hint="Ước tính thời gian đọc các bài đã mở"
              icon="clock"
            />
          </div>
          <div className="bg-surface dark:bg-[#151b18]">
            <Stat
              label="Điểm quiz TB"
              value={stats.quizAvg === null ? '—' : String(stats.quizAvg)}
              unit={stats.quizAvg === null ? '' : '%'}
              hint={
                stats.quizAvg === null
                  ? 'Chưa làm quiz nào'
                  : `Trên ${stats.quizzedCount} bài đã làm`
              }
              icon="cards"
            />
          </div>
          <div className="bg-surface dark:bg-[#151b18]">
            <Stat
              label="Module xong"
              value={String(stats.modulesDone)}
              unit={`/ ${modules.length}`}
              hint="Module đạt 100% số bài"
              icon="target"
            />
          </div>
        </div>
      </section>

      {/* Băng hành động: tiếp tục đúng chỗ đã dừng */}
      {continueLesson && (
        <button
          type="button"
          onClick={() => onSelectLesson(continueLesson.lesson.slug)}
          className="group flex w-full items-center gap-4 rounded-lg bg-pine-600 px-4 py-3.5 text-left text-white transition-colors hover:bg-pine-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-600 sm:px-5 dark:bg-pine-500 dark:text-[#0b1512] dark:hover:bg-pine-400"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-white/15 dark:bg-black/15">
            <Icon name="play" className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/75 dark:text-[#0b1512]/70">
              Tiếp tục học · {continueLesson.module.vi} · {continueLesson.lesson.minutes}′
            </span>
            <span className="block truncate font-display text-[17px] font-semibold leading-snug">
              {continueLesson.lesson.title}
            </span>
          </span>
          <Icon
            name="arrowUpRight"
            className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>
      )}

      {/* Giáo trình đại cương: 6 module đánh số, chương kẻ ô */}
      <div className="space-y-5">
        {modules.map((mod, index) => (
          <ModuleSection
            key={mod.key}
            mod={mod}
            index={index}
            onSelectLesson={onSelectLesson}
          />
        ))}
      </div>

      <p className="border-t border-line pt-3 text-[12px] leading-relaxed text-slate-500 dark:border-white/[0.08] dark:text-slate-400">
        Nội dung giáo dục cho huấn luyện viên, biên soạn từ nguồn uy tín liệt kê cuối mỗi
        bài — không thay thế đào tạo chứng chỉ hành nghề hay tư vấn y tế.
      </p>
    </div>
  );
}
