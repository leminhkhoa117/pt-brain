import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo.jsx';
import { Icon } from './ui.jsx';

const HIGHLIGHTS = [
  { icon: 'book', label: 'Nghiên cứu', text: 'Tìm và tóm tắt bài báo thật từ PubMed, Europe PMC, OpenAlex — giữ nguyên số liệu và trích dẫn.' },
  { icon: 'calculator', label: 'Tính toán', text: '1RM, TDEE, macro, % mỡ, FFMI, vùng nhịp tim — cùng một hệ quy chiếu.' },
  { icon: 'activity', label: 'Theo dõi', text: 'Cân nặng, số đo, ảnh tiến độ và cảnh báo theo quy tắc.' },
  { icon: 'dumbbell', label: 'Giáo án', text: 'Lên split, log buổi tập, đọc volume theo nhóm cơ và điều chỉnh tải.' },
];

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen bg-paper dark:bg-[#0e1211] lg:grid-cols-[minmax(0,1fr)_520px]">
      <div className="flex min-h-screen flex-col px-5 py-8 sm:px-8 lg:px-14">
        <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col lg:mx-0">
          <Link to="/" className="flex w-fit items-center gap-2.5">
            <BrandLogo size={34} />
            <span>
              <span className="block font-display text-[17px] font-semibold leading-none text-slate-900 dark:text-white">
                PT Brain
              </span>
              <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.16em] text-pine-700 dark:text-pine-200/80">
                Evidence-based coaching
              </span>
            </span>
          </Link>

          <div className="flex flex-1 items-center">
            <div className="w-full py-10">
              <h1 className="font-display text-[30px] font-semibold leading-tight tracking-[-0.02em] text-slate-900 dark:text-white">
                {title}
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>

              <div className="mt-7">{children}</div>
              {footer && (
                <div className="mt-6 border-t border-line pt-4 text-[12.5px] text-slate-500 dark:border-white/[0.08] dark:text-slate-400">
                  {footer}
                </div>
              )}
            </div>
          </div>

          <p className="font-mono text-[12px] leading-relaxed tracking-normal text-slate-500 dark:text-slate-400">
            Chỉ số chỉ mang tính ước lượng · Không thay thế bác sĩ
          </p>
        </div>
      </div>

      <aside className="relative hidden flex-col justify-between border-l border-line bg-shell px-10 py-12 text-white lg:flex xl:px-14">
        <div>
          <h2 className="max-w-[380px] font-display text-[34px] font-semibold leading-[1.15] tracking-[-0.02em]">
            Bằng chứng, con số và giáo án trong cùng một cuốn sổ.
          </h2>
          <p className="mt-4 max-w-[360px] text-[13px] leading-relaxed text-white/60">
            Từ câu hỏi tiếng Việt đến nghiên cứu thật, từ chỉ số cơ thể đến buổi tập hôm nay.
          </p>
        </div>

        <ul className="my-10 divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {HIGHLIGHTS.map((item, index) => (
            <li key={item.label} className="flex gap-3 py-3.5">
              <span className="mt-0.5 font-mono text-[11px] tabular-nums text-pine-200/80">
                {String(index + 1).padStart(2, '0')}
              </span>
              <Icon name={item.icon} className="mt-0.5 h-4 w-4 shrink-0 text-pine-300" />
              <div>
                <p className="text-[12.5px] font-semibold text-white/90">{item.label}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-white/60">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.1em] text-white/55">
          <span>PT Brain · 2026</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-pine-300" />
            Dữ liệu của bạn
          </span>
        </div>
      </aside>
    </div>
  );
}
