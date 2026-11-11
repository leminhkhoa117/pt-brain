import clsx from 'clsx';
import { lastNDays } from '../lib/date.js';
import { formatNumber } from '../lib/format.js';

export default function Heatmap({ logs = [], weeks = 8 }) {
  const map = new Map(logs.map((l) => [l.dateKey, l.weightKg]));
  const days = lastNDays(weeks * 7);
  const columns = [];
  for (let i = 0; i < days.length; i += 7) columns.push(days.slice(i, i + 7));
  const today = days.at(-1);

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {columns.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((key) => {
              const weight = map.get(key);
              const isToday = key === today;
              return (
                <div
                  key={key}
                  title={weight ? `${key}: ${formatNumber(weight, 1)} kg` : `${key}: chưa nhập`}
                  className={clsx(
                    'h-[18px] w-[18px] rounded-sm border',
                    weight
                      ? 'border-pine-700 bg-pine-600 dark:border-pine-400 dark:bg-pine-500'
                      : 'border-line bg-paper-2 dark:border-white/[0.08] dark:bg-white/[0.04]',
                    isToday && 'ring-1 ring-pine-600 ring-offset-1 ring-offset-surface dark:ring-pine-300 dark:ring-offset-[#151b18]',
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.06em] text-slate-500 dark:text-slate-400">
        <span>{weeks} tuần gần nhất</span>
        <span className="flex items-center gap-1.5 normal-case tracking-normal">
          Chưa nhập
          <span className="h-2.5 w-2.5 rounded-sm border border-line bg-paper-2 dark:border-white/10 dark:bg-white/[0.04]" />
          <span className="h-2.5 w-2.5 rounded-sm bg-pine-600 dark:bg-pine-500" />
          Đã nhập
        </span>
      </div>
    </div>
  );
}
