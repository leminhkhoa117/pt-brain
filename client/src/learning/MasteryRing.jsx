export default function MasteryRing({ value = 0, size = 52, label = 'Mastery' }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex items-center gap-2" title={`${label}: ${clamped}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label} ${clamped}%`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-line dark:text-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="text-pine-600 transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none dark:text-pine-400"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          className="fill-slate-800 font-mono text-[12px] font-semibold dark:fill-slate-100"
        >
          {clamped}%
        </text>
      </svg>
      <div className="min-w-0">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {clamped >= 80 ? 'Vững' : clamped >= 40 ? 'Đang lên' : 'Mới bắt đầu'}
        </p>
      </div>
    </div>
  );
}
