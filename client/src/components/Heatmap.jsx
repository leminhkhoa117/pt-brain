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
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {columns.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1.5">
            {week.map((key) => {
              const weight = map.get(key);
              const isToday = key === today;
              return (
                <div
                  key={key}
                  title={weight ? `${key}: ${formatNumber(weight, 1)} kg` : `${key}: chưa nhập`}
                  className={clsx(
                    'h-6 w-6 rounded-md border text-center',
                    weight
                      ? 'border-brand-600/30 bg-brand-500 dark:border-brand-400/30 dark:bg-brand-500'
                      : 'border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60',
                    isToday && 'ring-2 ring-brand-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900',
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>{weeks} tuần gần nhất</span>
        <span className="flex items-center gap-1.5">
          Chưa nhập
          <span className="h-3 w-3 rounded border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60" />
          <span className="h-3 w-3 rounded bg-brand-500" />
          Đã nhập
        </span>
      </div>
    </div>
  );
}
