import LatticeLoader from '../reactbits/LatticeLoader/LatticeLoader.jsx';

/**
 * Loading nhỏ cho các job AI ngắn trong Research (tạo tóm tắt, tìm bài).
 * Dùng Lattice Loader React Bits để đồng bộ với trạng thái AI đang xử lý.
 */
export default function ResearchJobProgress({
  stage = 'Đang xử lý',
  elapsed = 0,
  note = 'Thường mất 20–90 giây; bài dài có thể lâu hơn. Bạn có thể rời tab, job vẫn chạy nền.',
  badge = 'Đang xử lý',
  progressBase = 8,
  progressRate = 3,
}) {
  return (
    <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-950/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LatticeLoader
          label={stage}
          status="working"
          pattern="rain"
          grid={4}
          shape="round"
          color="currentColor"
          cellSize={4}
          gap={1.8}
          fontSize={12.5}
          step={82}
          idleOpacity={0.18}
          glow
          elapsed={elapsed}
          className="text-brand-800 dark:text-brand-200"
        />
        <span className="badge bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-200">
          {badge}
        </span>
      </div>
      <p className="mt-2 text-xs text-brand-700/70 dark:text-brand-300/70">{note}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-brand-200/70 dark:bg-brand-900">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-700 dark:bg-brand-400"
          style={{ width: `${Math.min(95, progressBase + elapsed * progressRate)}%` }}
        />
      </div>
    </div>
  );
}
