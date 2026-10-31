import { Link } from 'react-router-dom';
import { Icon } from './ui.jsx';

const HIGHLIGHTS = [
  'Tìm nghiên cứu thật từ PubMed, Europe PMC, OpenAlex',
  'Tóm tắt bài báo sang tiếng Việt, giữ nguyên số liệu',
  'Tính 1RM, TDEE, macro, % mỡ, FFMI tức thì',
  'Theo dõi cân nặng, số đo và cảnh báo theo quy tắc',
];

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen bg-slate-100 dark:bg-slate-950 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-lg font-black backdrop-blur">
            PT
          </span>
          <span>
            <span className="block text-lg font-bold">PT Brain</span>
            <span className="block text-[11px] uppercase tracking-[0.2em] text-brand-200">
              Evidence-based training
            </span>
          </span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Một nơi để học, tính toán và lên giáo án như một PT chuyên nghiệp.
          </h2>
          <ul className="mt-8 space-y-3.5">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-brand-50/90">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/15">
                  <Icon name="check" className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-brand-100/70">
          Chỉ số và gợi ý chỉ mang tính ước lượng, không thay thế bác sĩ hoặc chuyên gia dinh dưỡng.
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 font-black text-white">
              PT
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">PT Brain</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
