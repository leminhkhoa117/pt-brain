import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatDateKey } from '../lib/date.js';
import { formatNumber } from '../lib/format.js';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 text-[11px] shadow-overlay dark:border-white/10 dark:bg-[#1b2320]">
      <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
        {formatDateKey(label, true)}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}:{' '}
          <span className="num font-medium text-slate-800 dark:text-slate-100">
            {formatNumber(entry.value, 1)} kg
          </span>
        </p>
      ))}
    </div>
  );
}

export default function WeightChart({ data = [], height = 300 }) {
  const chartData = data.map((d) => ({ ...d, label: formatDateKey(d.dateKey) }));

  if (!chartData.length) {
    return (
      <div className="flex h-[240px] items-center justify-center rounded-md border border-dashed border-line text-[12px] text-slate-500 dark:text-slate-400 dark:border-white/10 dark:text-slate-500">
        Chưa có dữ liệu cân nặng để vẽ biểu đồ.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid
            strokeDasharray="2 4"
            stroke="currentColor"
            className="text-slate-200 dark:text-white/[0.08]"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'currentColor', fontFamily: 'Roboto Mono, monospace' }}
            className="text-slate-500 dark:text-slate-400"
            tickLine={false}
            axisLine={false}
            minTickGap={28}
          />
          <YAxis
            domain={['dataMin - 1', 'dataMax + 1']}
            tick={{ fontSize: 11, fill: 'currentColor', fontFamily: 'Roboto Mono, monospace' }}
            className="text-slate-500 dark:text-slate-400"
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v) => formatNumber(v, 1)}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#9a9585', strokeDasharray: '2 3' }} />
          <Line
            type="monotone"
            dataKey="weightKg"
            name="Cân nặng"
            stroke="#0b5642"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3.5, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="ma7"
            name="Trung bình 7 ngày"
            stroke="#a9761b"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
