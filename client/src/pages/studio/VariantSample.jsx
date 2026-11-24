export default function VariantSample({ group }) {
  switch (group) {
    case 'button':
      return (
        <div className="flex flex-col items-stretch gap-1">
          <span className="btn btn-primary btn-sm justify-center">Áp dụng</span>
          <span className="text-center font-mono text-[8px] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
            primary
          </span>
        </div>
      );
    case 'card':
      return (
        <div className="panel w-full p-2.5">
          <p className="font-display text-[10px] font-semibold text-slate-900 dark:text-slate-50">
            Buổi tập A
          </p>
          <div className="mt-2 h-1.5 w-3/4 rounded-sm bg-slate-200 dark:bg-white/10" />
          <div className="mt-1.5 h-1.5 w-1/2 rounded-sm bg-slate-200/70 dark:bg-white/[0.07]" />
        </div>
      );
    case 'input':
      return (
        <div className="block w-full">
          <span className="label !mb-1 !text-[8px]">Cân nặng</span>
          <div className="input flex !h-7 items-center !text-[10px]">72,4 kg</div>
        </div>
      );
    case 'tabs':
      return (
        <div className="tabbar" role="tablist" aria-label="Mẫu tab">
          <span className="tab tab-active !h-7 !px-2 !text-[9px]" role="tab" aria-selected="true">
            Tuần
          </span>
          <span className="tab !h-7 !px-2 !text-[9px]" role="tab" aria-selected="false">
            Tháng
          </span>
          <span className="tab !h-7 !px-2 !text-[9px]" role="tab" aria-selected="false">
            Năm
          </span>
        </div>
      );
    case 'badge':
      return (
        <div className="flex flex-wrap items-center justify-center gap-1">
          <span className="badge badge-pine">Pine</span>
          <span className="badge badge-neutral">Neutral</span>
        </div>
      );
    case 'metric':
      return (
        <div className="metric-strip w-full !grid-cols-2">
          <div className="metric">
            <p className="metric-label !text-[7px]">Cân nặng</p>
            <p className="metric-value !text-[15px]">
              72,4<span className="metric-unit !text-[7px]">kg</span>
            </p>
          </div>
          <div className="metric">
            <p className="metric-label !text-[7px]">% mỡ</p>
            <p className="metric-value !text-[15px]">
              18,6<span className="metric-unit !text-[7px]">%</span>
            </p>
          </div>
        </div>
      );
    case 'table':
      return (
        <table className="table-clinical w-full !text-[8px]">
          <thead>
            <tr>
              <th className="!py-1 !pr-1 !text-[7px]">Bài</th>
              <th className="!py-1 !pr-1 !text-[7px]">Set</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="!py-1 !pr-1">Bench</td>
              <td className="num !py-1 !pr-1">4 × 8</td>
            </tr>
            <tr>
              <td className="!py-1 !pr-1">Row</td>
              <td className="num !py-1 !pr-1">4 × 10</td>
            </tr>
          </tbody>
        </table>
      );
    case 'shell':
      return (
        <div className="app-shell flex h-full min-h-[56px] w-full flex-col gap-1 rounded-md border border-white/10 p-1.5">
          <div className="flex items-center gap-1">
            <span className="grid h-3.5 w-3.5 place-items-center rounded-sm bg-pine-400 font-mono text-[5px] font-bold text-pine-950">
              PT
            </span>
            <span className="h-1 w-8 rounded-full bg-white/50" />
          </div>
          <span className="h-1 w-full rounded-full bg-white/15" />
          <span className="h-1 w-3/4 rounded-full bg-white/12" />
          <span className="h-1 w-2/3 rounded-full bg-white/10" />
        </div>
      );
    case 'header':
      return (
        <div className="app-header flex h-8 w-full items-center gap-1.5 rounded-md border border-line px-2 dark:border-white/10">
          <span className="h-1.5 w-8 rounded-full bg-slate-300 dark:bg-white/20" />
          <span className="h-1.5 w-5 rounded-full bg-slate-200 dark:bg-white/10" />
          <span className="ml-auto h-3 w-3 rounded-full bg-pine-600 dark:bg-pine-300" />
        </div>
      );
    case 'pageHead':
      return (
        <div className="page-head mb-0 w-full !pb-1">
          <div className="min-w-0">
            <p className="page-title !text-[15px]">Tổng quan</p>
            <p className="page-sub !mt-0.5 !text-[8px]">Buổi tập hôm nay</p>
          </div>
        </div>
      );
    default:
      return null;
  }
}
