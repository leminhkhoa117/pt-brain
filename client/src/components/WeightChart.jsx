import {
  Area,
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
  const seen = new Set();
  const rows = payload.filter((entry) => {
    if (seen.has(entry.dataKey)) return false;
    seen.add(entry.dataKey);
    return true;
  });
  const dateKey = payload[0]?.payload?.dateKey;
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 text-[11px] shadow-overlay dark:border-white/10 dark:bg-[#1b2320]">
      <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
        {dateKey ? formatDateKey(dateKey, true) : label || '—'}
      </p>
      {rows.map((entry) => (
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

export default function WeightChart({ data = [], height = 280 }) {
  const chartData = data.map((d) => ({ ...d, label: formatDateKey(d.dateKey) }));

  if (!chartData.length) {
    return (
      <div className="relative flex h-[248px] flex-col items-center justify-center overflow-hidden rounded-md border border-dashed border-line bg-paper-2/40 px-4 text-center dark:border-white/10 dark:bg-white/[0.015]">
        <svg
          viewBox="0 0 360 90"
          className="h-16 w-64 text-pine-700/35 dark:text-pine-300/30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 72h336" strokeDasharray="2 5" opacity="0.45" />
          <path d="M24 58c34-4 52-24 88-20s54 18 92-6 64-20 132-12" />
          <path
            d="M24 62c42-6 68-14 114-14s76-6 198-20"
            stroke="#a9761b"
            strokeDasharray="4 4"
            opacity="0.7"
          />
          <circle cx="112" cy="38" r="3" fill="currentColor" />
          <circle cx="204" cy="32" r="3" fill="currentColor" />
          <circle cx="336" cy="20" r="3" fill="currentColor" />
        </svg>
        <p className="mt-2 text-[12.5px] font-medium text-slate-700 dark:text-slate-200">
          Chưa có dữ liệu cân nặng để vẽ biểu đồ
        </p>
        <p className="mt-0.5 max-w-sm text-[11.5px] text-slate-500 dark:text-slate-400">
          Nhập cân nặng đầu tiên ở ô “Ghi nhanh” bên cạnh để bắt đầu theo dõi đường trung bình trượt 7 ngày (MA7).
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-end gap-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-pine-700 dark:bg-pine-400" />
          Cân nặng ngày
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-3.5 border-t-2 border-dashed border-ochre-500" />
          TB 7 ngày (MA7)
        </span>
      </div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="weightAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0e6b52" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0e6b52" stopOpacity={0.0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="weightKg"
              name="Cân nặng"
              stroke="none"
              fill="url(#weightAreaFill)"
              tooltipType="none"
            />
            <Line
              type="monotone"
              dataKey="weightKg"
              name="Cân nặng"
              stroke="#0e6b52"
              strokeWidth={2.2}
              dot={chartData.length <= 14 ? { r: 2.5, fill: '#0e6b52', strokeWidth: 0 } : false}
              activeDot={{ r: 4, strokeWidth: 0, fill: '#0e6b52' }}
            />
            <Line
              type="monotone"
              dataKey="ma7"
              name="Trung bình 7 ngày"
              stroke="#a9761b"
              strokeWidth={1.75}
              strokeDasharray="5 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
