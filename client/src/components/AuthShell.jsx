import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo.jsx';
import { Icon } from './ui.jsx';

const HIGHLIGHTS = [
  { icon: 'book', text: 'Tìm và tóm tắt nghiên cứu thật từ PubMed, Europe PMC, OpenAlex' },
  { icon: 'target', text: 'Tính 1RM, TDEE, macro, % mỡ, FFMI tức thì' },
  { icon: 'activity', text: 'Theo dõi cân nặng, số đo, ảnh tiến độ và cảnh báo theo quy tắc' },
  { icon: 'dumbbell', text: 'Lên giáo án, log buổi tập và gợi ý progressive overload' },
];

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen bg-[#f4f7f6] dark:bg-[#070b10] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[#071114] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-brand-500/20 blur-[100px]" />
          <div className="absolute -bottom-32 -left-24 h-[420px] w-[420px] rounded-full bg-teal-300/10 blur-[100px]" />
          <div className="surface-grid absolute inset-0 opacity-[0.14]" />
        </div>

        <Link to="/" className="relative flex items-center gap-3">
          <BrandLogo size={46} glow />
          <span>
            <span className="block text-lg font-extrabold tracking-tight">PT Brain</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-brand-200/70">
              Evidence-based coaching
            </span>
          </span>
        </Link>

        <div className="relative max-w-xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Gym · Science · Coaching
          </p>
          <h2 className="text-[2.6rem] font-extrabold leading-[1.1] tracking-[-0.03em] xl:text-[3.1rem]">
            Khoa học tập luyện,
            <br />
            <span className="bg-gradient-to-r from-brand-300 via-teal-200 to-emerald-200 bg-clip-text text-transparent">
              trong một bộ não.
            </span>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-300/80">
            Từ câu hỏi tiếng Việt đến nghiên cứu thật, bản tóm tắt giữ nguyên số liệu, giáo án và
            nhật ký tập — tất cả ở một nơi.
          </p>

          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-sm text-slate-200/85">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-brand-300">
                  <Icon name={item.icon} className="h-3.5 w-3.5" />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-between gap-4 text-[11px] text-slate-400">
          <span>Chỉ số chỉ mang tính ước lượng, không thay thế bác sĩ.</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            AI: DeepSeek V4.1 Flash
          </span>
        </div>
      </div>

      <div className="relative flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-brand-100/50 to-transparent dark:from-brand-950/30" />
        <div className="relative w-full max-w-md">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <BrandLogo size={40} />
            <span>
              <span className="block text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                PT Brain
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
                Evidence-based coaching
              </span>
            </span>
          </div>

          <h1 className="text-[1.75rem] font-extrabold tracking-[-0.02em] text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{subtitle}</p>

          <div className="mt-7 rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_30px_60px_-40px_rgba(15,23,42,0.5)] backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.03] sm:p-6">
            {children}
          </div>
          {footer && <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
