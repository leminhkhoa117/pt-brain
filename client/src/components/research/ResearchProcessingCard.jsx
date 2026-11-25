import { Card } from '../ui.jsx';
import LatticeLoader from '../reactbits/LatticeLoader/LatticeLoader.jsx';

/**
 * Trạng thái AI đang tóm tắt bài: Lattice Loader của React Bits + tiến trình
 * đọc/tóm tắt. Tách riêng để dễ test và tái sử dụng ở các job dài khác.
 */
export default function ResearchProcessingCard({
  progress = 'Đang xử lý...',
  elapsed = 0,
  onBack,
  backLabel = 'Về thư viện',
}) {
  return (
    <Card className="relative overflow-hidden !p-0">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,107,82,0.14),transparent_58%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(95,191,158,0.13),transparent_58%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(14,107,82,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,107,82,0.08)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_72%)] dark:opacity-25 dark:[background-image:linear-gradient(to_right,rgba(95,191,158,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(95,191,158,0.08)_1px,transparent_1px)]"
      />

      <div className="relative px-5 py-10 text-center sm:px-8 sm:py-12">
        <div className="flex justify-center text-pine-700 dark:text-pine-300">
          <LatticeLoader
            label="AI đang đọc và tóm tắt"
            status="working"
            pattern="orbit"
            grid={4}
            shape="round"
            color="currentColor"
            cellSize={9}
            gap={4}
            fontSize={15}
            step={110}
            idleOpacity={0.16}
            glow
            elapsed={elapsed}
          />
        </div>

        <h2 className="mt-6 font-display text-[22px] font-semibold tracking-[-0.01em] text-slate-900 dark:text-white">
          Đang tóm tắt bài...
        </h2>
        <p className="mx-auto mt-1.5 max-w-[42ch] text-sm text-slate-600 dark:text-slate-400">
          {progress || 'Đang xử lý...'}
        </p>

        <div className="mx-auto mt-6 max-w-[420px]">
          <div className="h-1.5 overflow-hidden rounded-full bg-pine-100 dark:bg-pine-900/50">
            <span className="research-scan block h-full w-1/3 rounded-full bg-pine-600 dark:bg-pine-300" />
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            <span>Thường 3–8 phút</span>
            <span>Tối đa 15 phút</span>
          </div>
        </div>

        <p className="mx-auto mt-4 max-w-[48ch] text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Bạn có thể rời tab — job vẫn chạy nền. Nếu quá 3 phút không có cập nhật, hệ thống sẽ báo
          lỗi để bạn bấm “Thử lại”.
        </p>

        {onBack ? (
          <button type="button" className="btn-secondary mt-5" onClick={onBack}>
            {backLabel}
          </button>
        ) : null}
      </div>
    </Card>
  );
}
