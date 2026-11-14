import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Icon } from '../components/ui.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { getErrorMessage } from '../api/client.js';

const STEPS = [
  {
    number: '01',
    title: 'Tìm & đọc nghiên cứu',
    text: 'Dán DOI, link PubMed/PMC hoặc PDF. AI tóm tắt tiếng Việt, giữ nguyên số liệu và chỉ rõ chỗ chỉ dựa trên abstract.',
    icon: 'book',
    art: 'research',
  },
  {
    number: '02',
    title: 'Tính chỉ số',
    text: '1RM, BMR, TDEE, macro, % mỡ US Navy, FFMI và vùng nhịp tim — tất cả dùng cùng một hồ sơ.',
    icon: 'calculator',
    art: 'calculator',
  },
  {
    number: '03',
    title: 'Theo dõi cơ thể',
    text: 'Cân nặng, số đo, giấc ngủ, calo và cardio. Biểu đồ MA7 giúp bạn đọc xu hướng thay vì dao động từng ngày.',
    icon: 'activity',
    art: 'tracking',
  },
  {
    number: '04',
    title: 'Lên giáo án & ôn tập',
    text: 'Tạo giáo án theo quy tắc hoặc AI, log buổi tập, đọc volume theo nhóm cơ và biến kiến thức thành flashcard.',
    icon: 'dumbbell',
    art: 'plan',
  },
];

const FEATURES = [
  {
    icon: 'book',
    title: 'Research Reader',
    text: 'Tóm tắt bài báo, dịch toàn văn, giải thích hình/bảng và hỏi đáp ngay trên bài đọc.',
    art: 'reader',
  },
  {
    icon: 'activity',
    title: 'Body Log',
    text: 'Một bản ghi mỗi ngày: cân nặng, số đo, ảnh tiến độ và cảnh báo theo quy tắc.',
    art: 'body',
  },
  {
    icon: 'dumbbell',
    title: 'Training Planner',
    text: 'Giáo án full body, upper/lower, PPL hoặc tự tạo; volume 10–20 set/nhóm cơ/tuần.',
    art: 'training',
  },
  {
    icon: 'utensils',
    title: 'Nutrition',
    text: 'Nhập bữa bằng ảnh hoặc tay, theo dõi calo/macro và đánh giá mức bám meal plan theo tuần.',
    art: 'nutrition',
  },
  {
    icon: 'body',
    title: 'Human Atlas 3D',
    text: '2.234 mảnh giải phẫu, 3.432 cấu trúc, tìm cơ và hỏi AI ngay trên mô hình 3D.',
    art: 'atlas',
  },
  {
    icon: 'cards',
    title: 'Learn & Review',
    text: 'Từ điển cá nhân, flashcard SM-2, quiz từ bài đã tóm tắt và sổ tay tìm kiếm toàn văn.',
    art: 'learn',
  },
];

function StepArt({ type }) {
  return (
    <svg
      viewBox="0 0 180 110"
      className="h-28 w-full text-pine-700 dark:text-pine-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {type === 'research' && (
        <>
          <rect x="26" y="12" width="82" height="84" rx="8" opacity="0.25" />
          <path d="M40 28h42M40 40h54M40 52h38M40 64h48M40 76h34" opacity="0.7" />
          <circle cx="116" cy="66" r="19" className="fill-white/70 dark:fill-slate-900/40" />
          <circle cx="116" cy="66" r="19" />
          <path d="m130 80 14 14" />
          <path d="M109 66h14M116 59v14" opacity="0.8" />
        </>
      )}
      {type === 'calculator' && (
        <>
          <rect x="48" y="10" width="72" height="90" rx="10" opacity="0.3" />
          <rect x="60" y="22" width="48" height="18" rx="3" />
          <path d="M60 54h10M78 54h10M96 54h10M60 70h10M78 70h10M96 70h10M60 86h10M78 86h10M96 86h10" />
          <path d="M142 82V30M142 52l-10-12M142 44l10-10" opacity="0.45" />
        </>
      )}
      {type === 'tracking' && (
        <>
          <path d="M24 88h132M24 88V18" opacity="0.4" />
          <path d="m34 74 24-18 18 8 24-28 18 12 26-24" />
          <circle cx="58" cy="56" r="4" className="fill-pine-700 dark:fill-pine-300" />
          <circle cx="100" cy="36" r="4" className="fill-pine-700 dark:fill-pine-300" />
          <circle cx="144" cy="12" r="4" className="fill-pine-700 dark:fill-pine-300" />
          <path d="M34 88v-6M58 88v-6M82 88v-6M106 88v-6M130 88v-6" opacity="0.35" />
        </>
      )}
      {type === 'plan' && (
        <>
          <rect x="34" y="16" width="82" height="82" rx="8" opacity="0.3" />
          <path d="M34 38h82M52 10v14M98 10v14" />
          <path d="M50 54h12M74 54h12M98 54h12M50 72h12M74 72h12" opacity="0.75" />
          <path d="M142 72h18M151 63v18" opacity="0.7" />
          <path d="M132 84c8-8 14-8 20 0" opacity="0.35" />
        </>
      )}
    </svg>
  );
}

function FeatureArt({ type }) {
  const common = 'h-20 w-full text-pine-700 dark:text-pine-300';
  return (
    <svg
      viewBox="0 0 220 90"
      className={common}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {type === 'reader' && (
        <>
          <rect x="18" y="14" width="108" height="62" rx="6" opacity="0.25" />
          <path d="M32 30h64M32 42h78M32 54h50M32 66h58" opacity="0.7" />
          <circle cx="158" cy="42" r="17" className="fill-white/70 dark:fill-slate-900/50" />
          <circle cx="158" cy="42" r="17" />
          <path d="m171 55 17 17" />
          <path d="M149 42h18M158 33v18" opacity="0.6" />
        </>
      )}
      {type === 'body' && (
        <>
          <path d="M38 82V20M38 82h132" opacity="0.35" />
          <path d="m50 66 22-14 18 6 26-24 20 10 22-18" />
          <circle cx="72" cy="52" r="3.5" className="fill-pine-700 dark:fill-pine-300" />
          <circle cx="116" cy="34" r="3.5" className="fill-pine-700 dark:fill-pine-300" />
          <circle cx="180" cy="20" r="3.5" className="fill-pine-700 dark:fill-pine-300" />
          <path d="M50 82v-5M74 82v-5M98 82v-5M122 82v-5M146 82v-5M170 82v-5" opacity="0.3" />
        </>
      )}
      {type === 'training' && (
        <>
          <rect x="20" y="18" width="64" height="56" rx="7" opacity="0.25" />
          <path d="M36 34h32M36 48h32M36 62h20" opacity="0.65" />
          <path d="M116 62h54M126 50v24M160 50v24M138 42v40M148 42v40" />
          <path d="M144 26h-10M144 26l-6-6M144 26l-6 6" opacity="0.35" />
        </>
      )}
      {type === 'nutrition' && (
        <>
          <circle cx="64" cy="46" r="30" opacity="0.3" />
          <path d="M64 16v60M48 32c0 12 7 20 16 20s16-8 16-20" opacity="0.7" />
          <path d="M126 28h58M126 42h44M126 56h52M126 70h36" opacity="0.6" />
        </>
      )}
      {type === 'atlas' && (
        <>
          <circle cx="82" cy="44" r="30" opacity="0.3" />
          <path d="M82 16v56M66 24c8 8 24 8 32 0M60 44c14-6 30-6 44 0M64 62c12 6 24 6 36 0" opacity="0.7" />
          <path d="M142 32h48M142 46h34M142 60h42" opacity="0.5" />
        </>
      )}
      {type === 'learn' && (
        <>
          <rect x="22" y="18" width="62" height="54" rx="7" opacity="0.3" />
          <rect x="40" y="28" width="62" height="54" rx="7" className="fill-white/70 dark:fill-slate-900/40" />
          <path d="M54 44h34M54 56h26M54 68h32" opacity="0.7" />
          <path d="M144 26v42M144 26l-8 12M144 26l8 12" opacity="0.35" />
          <path d="M164 40h38M164 54h28M164 68h34" opacity="0.55" />
        </>
      )}
    </svg>
  );
}

function Arrow({ vertical = false }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center text-pine-500 dark:text-pine-400 ${
        vertical ? 'py-1' : 'px-1'
      }`}
      aria-hidden="true"
    >
      <Icon
        name="arrowRight"
        className={`h-5 w-5 ${vertical ? 'rotate-90' : ''}`}
      />
    </div>
  );
}

export default function Welcome() {
  const { user, completeWelcome } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const start = async () => {
    setError('');
    setBusy(true);
    try {
      if (user?.onboardingRequired) await completeWelcome();
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="space-y-10">
      <section className="hero-surface relative overflow-hidden rounded-lg border border-white/[0.08] text-white shadow-overlay">
        {/* Nền: ánh sáng khí quyển + quầng sáng chuyển động + hạt nhiễu nhẹ */}
        <div className="hero-atmosphere pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="hero-aurora -left-20 -top-32 h-80 w-80" />
          <div className="hero-aurora hero-aurora-b right-[2%] top-[-14%] h-72 w-72" />
          <div className="hero-aurora hero-aurora-c bottom-[-38%] left-[26%] h-80 w-80" />
        </div>

        {/* Vòng quỹ đạo dữ liệu bên phải */}
        <div
          className="pointer-events-none absolute -right-36 top-1/2 hidden h-[580px] w-[580px] -translate-y-1/2 opacity-80 lg:block xl:-right-24"
          aria-hidden="true"
        >
          <svg viewBox="0 0 640 640" fill="none" className="h-full w-full">
            <defs>
              <linearGradient
                id="hero-ring"
                x1="118"
                y1="128"
                x2="528"
                y2="510"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#e8e5db" stopOpacity="0.26" />
                <stop offset="0.48" stopColor="#5fbf9e" stopOpacity="0.42" />
                <stop offset="1" stopColor="#c19234" stopOpacity="0.32" />
              </linearGradient>
              <radialGradient id="hero-core" cx="0" cy="0" r="1" gradientTransform="translate(320 320) rotate(90) scale(238)">
                <stop stopColor="#5fbf9e" stopOpacity="0.14" />
                <stop offset="1" stopColor="#5fbf9e" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="320" cy="320" r="238" stroke="url(#hero-ring)" strokeWidth="1.2" />
            <circle cx="320" cy="320" r="238" fill="url(#hero-core)" />
            <circle cx="320" cy="320" r="176" stroke="#77b29b" strokeOpacity="0.16" strokeWidth="1" />
            <path
              d="M320 70v18M320 552v18M70 320h18M552 320h18"
              stroke="#77b29b"
              strokeOpacity="0.45"
              strokeLinecap="round"
            />
            <g className="hero-orbit">
              <circle
                cx="320"
                cy="320"
                r="204"
                stroke="#77b29b"
                strokeOpacity="0.34"
                strokeDasharray="2 11"
                strokeWidth="1.2"
              />
              <circle cx="524" cy="320" r="5" fill="#77b29b" fillOpacity="0.9" />
              <circle cx="320" cy="116" r="3" fill="#e8e5db" fillOpacity="0.8" />
            </g>
            <g className="hero-orbit hero-orbit-reverse">
              <circle
                cx="320"
                cy="320"
                r="146"
                stroke="#5fbf9e"
                strokeOpacity="0.26"
                strokeDasharray="1 8"
                strokeWidth="1"
              />
              <circle cx="320" cy="174" r="4" fill="#c19234" fillOpacity="0.9" />
            </g>
            <circle cx="320" cy="320" r="10" stroke="#5fbf9e" strokeOpacity="0.35" />
            <circle cx="320" cy="320" r="3.5" fill="#77b29b" fillOpacity="0.8" />
          </svg>
        </div>

        {/* Tín hiệu ECG chạy dọc đáy banner */}
        <div
          className="pointer-events-none absolute bottom-14 right-0 hidden h-28 w-[62%] opacity-70 sm:block"
          aria-hidden="true"
        >
          <svg viewBox="0 0 1200 180" preserveAspectRatio="none" fill="none" className="h-full w-full">
            <defs>
              <linearGradient id="hero-pulse" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#5fbf9e" stopOpacity="0" />
                <stop offset="0.18" stopColor="#5fbf9e" stopOpacity="0.55" />
                <stop offset="0.55" stopColor="#e8e5db" stopOpacity="0.5" />
                <stop offset="0.85" stopColor="#c19234" stopOpacity="0.45" />
                <stop offset="1" stopColor="#c19234" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 132H120l26 0 20-40 24 66 24-106 24 80h114l22-20 20 38 24-54 24 36h110l22-14 20 34 24-50 24 26h118l22-12 20 28 24-44 24 24h116l22-14 20 32 24-46 24 28h116"
              stroke="url(#hero-pulse)"
              strokeWidth="1.4"
              strokeOpacity="0.3"
            />
            <path
              d="M0 132H120l26 0 20-40 24 66 24-106 24 80h114l22-20 20 38 24-54 24 36h110l22-14 20 34 24-50 24 26h118l22-12 20 28 24-44 24 24h116l22-14 20 32 24-46 24 28h116"
              className="hero-pulse-line"
              stroke="#5fbf9e"
              strokeWidth="1.4"
              strokeOpacity="0.55"
            />
            <path
              d="M0 132H120l26 0 20-40 24 66 24-106 24 80h114l22-20 20 38 24-54 24 36h110l22-14 20 34 24-50 24 26h118l22-12 20 28 24-44 24 24h116l22-14 20 32 24-46 24 28h116"
              className="hero-pulse-line-slow"
              stroke="#e8e5db"
              strokeWidth="1"
              strokeOpacity="0.28"
            />
          </svg>
        </div>

        <div className="hero-noise pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative px-5 py-11 sm:px-10 sm:py-14">
          <div className="max-w-3xl">
            <div className="hero-reveal flex items-center gap-3" style={{ animationDelay: '60ms' }}>
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                <span className="absolute inset-0 rounded-md bg-pine-400/25 blur-md" aria-hidden="true" />
                <img src="/logo-mark.png" alt="" className="relative h-11 w-11 rounded-md" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-pine-300">
                PT Brain · Evidence-based training
              </span>
              <span
                className="hidden h-px flex-1 bg-gradient-to-r from-pine-300/35 via-pine-300/10 to-transparent sm:block"
                aria-hidden="true"
              />
            </div>
            <h1
              className="hero-reveal mt-6 max-w-3xl font-display text-[32px] leading-tight sm:text-[44px]"
              style={{ animationDelay: '140ms' }}
            >
              Biến nghiên cứu và dữ liệu cơ thể thành một giáo án bạn thực sự hiểu.
            </h1>
            <p
              className="hero-reveal mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base"
              style={{ animationDelay: '220ms' }}
            >
              PT Brain gom việc đọc bài báo, tính chỉ số, theo dõi cân nặng – số đo – cardio và lên
              giáo án vào một chỗ. Không phải một app ghi chép thêm, mà là một vòng lặp học → áp dụng
              → đo lại.
            </p>
            <div
              className="hero-reveal mt-7 flex flex-wrap gap-2.5"
              style={{ animationDelay: '300ms' }}
            >
              <button type="button" className="btn-primary" onClick={start} disabled={busy}>
                {busy ? 'Đang mở...' : 'Bắt đầu theo dõi'}
                <Icon name="arrowRight" className="h-4 w-4" />
              </button>
              <a href="#chuc-nang" className="btn-secondary border-white/20 bg-white/10 text-white shadow-none hover:bg-white/15">
                Xem cách hoạt động
                <Icon name="chevronDown" className="h-4 w-4" />
              </a>
            </div>
            {user?.onboardingRequired && (
              <p className="hero-reveal mt-4 text-xs text-pine-200" style={{ animationDelay: '360ms' }}>
                Chào mừng tài khoản mới. Bạn có thể xem nhanh trang này trước khi vào Tổng quan.
              </p>
            )}
          </div>
        </div>

        {/* Dải thông số tổng quan dưới đáy banner */}
        <div className="relative grid grid-cols-2 divide-x divide-y divide-white/[0.08] border-t border-white/[0.08] bg-black/25 backdrop-blur-sm sm:grid-cols-4 sm:divide-y-0">
          {[
            ['Nguồn học thuật', 'PubMed · PMC · OpenAlex'],
            ['Công thức lâm sàng', '1RM · TDEE · Navy · FFMI'],
            ['Thư viện & Giải phẫu', '105 bài tập · 59 cơ 3D'],
            ['Nguyên tắc AI', 'Giữ nguyên số liệu gốc'],
          ].map(([label, value]) => (
            <div key={label} className="px-4 py-3 sm:px-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-pine-300/80">
                {label}
              </p>
              <p className="mt-0.5 text-[12.5px] font-medium text-white/90">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {error && <Alert tone="danger">{error}</Alert>}

      <section id="muc-dich" className="grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="panel flex flex-col justify-between overflow-hidden p-0">
          <div className="p-5 sm:p-7">
            <h2 className="font-display text-[26px] leading-tight text-slate-900 dark:text-white sm:text-[30px]">
              Một nơi để trả lời: “Tôi nên tập gì, ăn gì và đo gì tiếp theo?”
            </h2>
            <p className="mt-3.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Phần lớn người tập phải mở quá nhiều tab: một trang đọc paper, một app đếm calo, một
              file Excel cân nặng và một ứng dụng ghi set. PT Brain nối chúng lại để mỗi quyết định
              đều có dữ liệu phía sau.
            </p>
          </div>
          <div className="grid divide-y divide-line border-t border-line bg-paper-2/45 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-white/[0.07] dark:border-white/[0.08] dark:bg-white/[0.02]">
            {[
              ['Đọc có chọn lọc', 'Ưu tiên bài tổng quan, meta-analysis và nguồn open access.'],
              ['Số liệu minh bạch', 'Công thức tính bằng code; AI chỉ giải thích và đề xuất.'],
              ['Theo dõi liên tục', 'Cân nặng, số đo, buổi tập và cardio nằm cùng một dòng thời gian.'],
            ].map(([title, text]) => (
              <div key={title} className="p-4 sm:p-5">
                <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{title}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel flex flex-col justify-between overflow-hidden p-0">
          <div className="border-b border-line bg-paper-2/55 p-5 dark:border-white/[0.08] dark:bg-white/[0.025]">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-[19px] font-semibold text-slate-900 dark:text-white">
                Vòng lặp huấn luyện 4 pha
              </h3>
              <span className="badge badge-pine">Chu trình khép kín</span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-1">
              {['Đọc', 'Hiểu', 'Áp dụng', 'Đo lại'].map((label, index) => (
                <div key={label} className="flex items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-pine-300/80 bg-surface font-mono text-xs font-semibold text-pine-700 dark:border-pine-700 dark:bg-slate-900 dark:text-pine-300">
                      {index + 1}
                    </span>
                    <span className="whitespace-nowrap text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {label}
                    </span>
                  </div>
                  {index < 3 && <Arrow />}
                </div>
              ))}
            </div>
          </div>

          <div className="border-b border-line bg-pine-50/45 px-5 py-4 dark:border-white/[0.08] dark:bg-pine-950/20">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-pine-700 dark:text-pine-300">
              Ví dụ một vòng lặp thực tế
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              Đọc một meta-analysis về volume → chọn tăng 2 set/tuần cho nhóm cơ yếu → log 4 tuần →
              so volume, cân nặng và cảm giác hồi phục rồi điều chỉnh.
            </p>
          </div>

          <div className="p-5">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Không cần làm tất cả ngay từ ngày đầu
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Bắt đầu bằng cân nặng và một buổi tập. Khi đã quen, thêm nghiên cứu, dinh dưỡng và
              theo dõi cardio. Trang này luôn mở lại được từ mục “Giới thiệu” trên thanh điều hướng.
            </p>
          </div>
        </div>
      </section>

      <section id="chuc-nang">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4 dark:border-white/[0.08]">
          <div>
            <h2 className="font-display text-[26px] leading-tight text-slate-900 dark:text-white sm:text-[30px]">
              Bốn bước để biến dữ liệu thành tiến bộ
            </h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Mỗi bước đều có dữ liệu đầu vào rõ ràng. Bạn có thể bắt đầu ở bất kỳ mục nào.
          </p>
        </div>

        <div className="panel mt-5 grid overflow-hidden divide-y divide-line p-0 md:grid-cols-2 md:divide-x lg:grid-cols-4 lg:divide-y-0 dark:divide-white/[0.08]">
          {STEPS.map((step) => (
            <article key={step.number} className="flex flex-col justify-between p-5 transition-colors hover:bg-paper-2/40 dark:hover:bg-white/[0.015]">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-pine-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-pine-700 dark:bg-pine-950/60 dark:text-pine-300">
                    Bước {step.number}
                  </span>
                  <span className="grid h-8 w-8 place-items-center rounded-md border border-line bg-surface text-pine-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-pine-300">
                    <Icon name={step.icon} className="h-4 w-4" />
                  </span>
                </div>
                <div className="my-3 rounded-md bg-paper-2/50 py-1 dark:bg-white/[0.02]">
                  <StepArt type={step.art} />
                </div>
                <h3 className="font-display text-[17px] font-semibold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {step.text}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="panel mt-6 grid overflow-hidden divide-y divide-line p-0 sm:grid-cols-2 sm:divide-x xl:grid-cols-3 dark:divide-white/[0.08]">
          {FEATURES.map((feature, index) => (
            <article
              key={feature.title}
              className="flex flex-col justify-between border-line p-5 transition-colors hover:bg-paper-2/40 sm:[&:nth-child(n+3)]:border-t xl:[&:nth-child(3)]:border-t-0 dark:border-white/[0.08] dark:hover:bg-white/[0.015]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-md border border-line bg-paper-2 text-pine-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-pine-300">
                      <Icon name={feature.icon} className="h-4 w-4" />
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <span className="font-mono text-[10.5px] text-slate-400 dark:text-slate-500">
                    M{String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="my-3 rounded-md bg-paper-2/45 py-1 dark:bg-white/[0.02]">
                  <FeatureArt type={feature.art} />
                </div>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {feature.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="bat-dau" className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hero-surface relative overflow-hidden rounded-lg border border-white/[0.08] p-5 text-white shadow-overlay sm:p-7">
          <div className="hero-atmosphere pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative">
            <h2 className="font-display text-[26px] leading-tight sm:text-[30px]">
              Bắt đầu theo dõi quá trình tập luyện
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              Chỉ cần 3 bước. Dữ liệu của bạn chỉ bạn thấy, có thể xuất CSV/PDF hoặc xóa toàn bộ bất
              cứ lúc nào.
            </p>
            <button type="button" className="btn-primary mt-6" onClick={start} disabled={busy}>
              {busy ? 'Đang mở...' : 'Vào Tổng quan'}
              <Icon name="arrowRight" className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="panel p-5 sm:p-7">
          {[
            ['01', 'Nhập hồ sơ', 'Giới tính, ngày sinh, chiều cao, cân nặng và mục tiêu ở trang Cài đặt.'],
            ['02', 'Ghi một con số hôm nay', 'Cân nặng, một buổi tập hoặc một buổi chạy bộ. Không cần hoàn hảo.'],
            ['03', 'Đọc xu hướng sau 1–2 tuần', 'Dùng biểu đồ MA7, volume theo nhóm cơ và lịch sử cardio để điều chỉnh.'],
          ].map(([number, title, text]) => (
            <div key={number} className="flex gap-3 border-b border-line py-3 last:border-0 last:pb-0 first:pt-0 dark:border-white/[0.08]">
              <span className="font-mono text-xs font-semibold text-pine-600 dark:text-pine-300">
                {number}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {text}
                </p>
              </div>
            </div>
          ))}
          <p className="mt-4 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Chỉ số và gợi ý chỉ mang tính ước lượng, không thay thế bác sĩ, PT hoặc chuyên gia dinh
            dưỡng. Bản tóm tắt AI có thể sai — hãy đối chiếu bài gốc với kết luận quan trọng.
          </p>
        </div>
      </section>
    </div>
  );
}
