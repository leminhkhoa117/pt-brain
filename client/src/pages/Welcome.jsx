import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionTemplate, useReducedMotion, useSpring } from 'motion/react';
import { Alert, Icon } from '../components/ui.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useTheme } from '../hooks/useTheme.jsx';
import { getErrorMessage } from '../api/client.js';
import TiltedCard from '../components/reactbits/TiltedCard/TiltedCard.jsx';
import CircularGallery from '../components/reactbits/CircularGallery/CircularGallery.jsx';
import InfiniteSpiral from '../components/reactbits/InfiniteSpiral/InfiniteSpiral.jsx';
import Stack from '../components/reactbits/Stack/Stack.jsx';
import {
  featureGalleryItems,
  phaseSpiralItems,
  protocolCardImage,
} from './welcomeArt.js';

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

const PRINCIPLES = [
  ['Đọc có chọn lọc', 'Ưu tiên bài tổng quan, meta-analysis và nguồn open access.'],
  ['Số liệu minh bạch', 'Công thức tính bằng code; AI chỉ giải thích và đề xuất.'],
  ['Theo dõi liên tục', 'Cân nặng, số đo, buổi tập và cardio nằm cùng một dòng thời gian.'],
];

const START_STEPS = [
  ['01', 'Nhập hồ sơ', 'Giới tính, ngày sinh, chiều cao, cân nặng và mục tiêu ở trang Cài đặt.'],
  ['02', 'Ghi một con số hôm nay', 'Cân nặng, một buổi tập hoặc một buổi chạy bộ. Không cần hoàn hảo.'],
  [
    '03',
    'Đọc xu hướng sau 1–2 tuần',
    'Dùng biểu đồ MA7, volume theo nhóm cơ và lịch sử cardio để điều chỉnh.',
  ],
];

const HERO_STATS = [
  ['Nguồn học thuật', 'PubMed · PMC · OpenAlex'],
  ['Công thức lâm sàng', '1RM · TDEE · Navy · FFMI'],
  ['Thư viện & Giải phẫu', '105 bài tập · 59 cơ 3D'],
  ['Nguyên tắc AI', 'Giữ nguyên số liệu gốc'],
];

const PHASES = ['Đọc', 'Hiểu', 'Áp dụng', 'Đo lại'];

const STEP_BACKGROUNDS = [
  'linear-gradient(145deg, #07110d 0%, #0d3a2c 100%)',
  'linear-gradient(145deg, #0b1813 0%, #2d2614 100%)',
  'linear-gradient(145deg, #0a1620 0%, #123b38 100%)',
  'linear-gradient(145deg, #07110d 0%, #26351a 100%)',
];

function StepArt({ type, className = 'text-pine-700 dark:text-pine-300' }) {
  return (
    <svg
      viewBox="0 0 180 110"
      className={`h-28 w-full ${className}`}
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
          <circle cx="58" cy="56" r="4" fill="currentColor" />
          <circle cx="100" cy="36" r="4" fill="currentColor" />
          <circle cx="144" cy="12" r="4" fill="currentColor" />
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

function FeatureArt({ type, className = 'text-pine-700 dark:text-pine-300' }) {
  return (
    <svg
      viewBox="0 0 220 90"
      className={`h-20 w-full ${className}`}
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
          <circle cx="72" cy="52" r="3.5" fill="currentColor" />
          <circle cx="116" cy="34" r="3.5" fill="currentColor" />
          <circle cx="180" cy="20" r="3.5" fill="currentColor" />
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

function LandingHeader({ user, isDark, onToggleTheme, onStart, busy, primaryLabel }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-shell/85 text-white backdrop-blur-md">
      <div className="mx-auto flex h-[62px] w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex min-w-0 items-center gap-2.5">
          <img src="/logo-mark.png" alt="" className="h-9 w-9 rounded-md" />
          <span className="font-display text-[17px] font-semibold tracking-[-0.01em]">PT Brain</span>
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.18em] text-pine-300/70 sm:inline">
            Evidence-based
          </span>
        </a>

        <nav className="hidden items-center gap-6 text-[12.5px] text-white/65 lg:flex">
          <a href="#muc-dich" className="transition-colors hover:text-white">
            Mục đích
          </a>
          <a href="#chuc-nang" className="transition-colors hover:text-white">
            Cách hoạt động
          </a>
          <a href="#bat-dau" className="transition-colors hover:text-white">
            Bắt đầu
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="grid h-9 w-9 place-items-center rounded-md border border-white/12 bg-white/[0.04] text-white/75 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={isDark ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'}
          >
            <Icon name={isDark ? 'sun' : 'moon'} className="h-4 w-4" />
          </button>
          {user ? (
            <button
              type="button"
              onClick={onStart}
              disabled={busy}
              className="btn-primary h-9 border-white/10 bg-pine-500 px-3 text-[12px] text-pine-950 hover:bg-pine-400"
            >
              {primaryLabel}
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden h-9 items-center rounded-md px-2.5 text-[12.5px] font-medium text-white/72 transition-colors hover:text-white sm:inline-flex"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="btn-primary h-9 border-white/10 bg-pine-500 px-3 text-[12px] text-pine-950 hover:bg-pine-400"
              >
                Tạo tài khoản
                <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function PageShell({ icon, kicker, badge = 'Dữ liệu mẫu', children }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[clamp(14px,calc(19px*var(--ts-radius,1)),30px)] bg-[linear-gradient(145deg,#0a1712_0%,#07110d_100%)] text-white">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-white/12 bg-white/[0.05] text-pine-200">
            <Icon name={icon} className="h-3 w-3" />
          </span>
          <span className="truncate font-mono text-[8.5px] uppercase tracking-[0.13em] text-white/55">
            {kicker}
          </span>
        </div>
        <span className="shrink-0 rounded-full border border-ochre-300/25 bg-ochre-400/10 px-2 py-0.5 font-mono text-[7.5px] uppercase tracking-[0.1em] text-ochre-200">
          {badge}
        </span>
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}

function DashboardMock() {
  return (
    <PageShell icon="dashboard" kicker="PT Brain / Hôm nay">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/45">Cân nặng</p>
          <p className="mt-1 font-display text-[32px] leading-none">
            72,4 <span className="text-[13px] font-normal text-white/50">kg</span>
          </p>
        </div>
        <span className="rounded-full border border-pine-300/25 bg-pine-400/10 px-2 py-1 font-mono text-[9px] text-pine-200">
          MA7 · -0,3 kg
        </span>
      </div>

      <svg viewBox="0 0 460 82" preserveAspectRatio="none" className="mt-3 h-[64px] w-full" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="welcome-stack-chart" x1="0" y1="0" x2="0" y2="1">
            <stop style={{ stopColor: 'rgb(var(--ts-accent-400))', stopOpacity: 0.28 }} />
            <stop offset="1" style={{ stopColor: 'rgb(var(--ts-accent-400))', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <path
          d="M0 64 C 36 60, 58 52, 86 56 S 136 42, 168 46 S 212 31, 244 39 S 292 25, 324 29 S 376 15, 408 21 S 444 11, 460 13 L 460 82 L 0 82 Z"
          fill="url(#welcome-stack-chart)"
        />
        <path
          d="M0 64 C 36 60, 58 52, 86 56 S 136 42, 168 46 S 212 31, 244 39 S 292 25, 324 29 S 376 15, 408 21 S 444 11, 460 13"
          style={{ stroke: 'rgb(var(--ts-accent-400))' }}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
          <p className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-white/45">Volume tuần</p>
          <p className="mt-1 font-display text-[18px] leading-none">
            14 <span className="text-[10px] font-normal text-white/50">set</span>
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
          <p className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-white/45">Giấc ngủ</p>
          <p className="mt-1 font-display text-[18px] leading-none">
            7h 20 <span className="text-[10px] font-normal text-white/50">/ đêm</span>
          </p>
        </div>
      </div>

      <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-white/45">
            Nghiên cứu gần đây
          </p>
          <span className="rounded-full bg-pine-400/10 px-1.5 py-0.5 font-mono text-[8px] text-pine-200">
            Đã tóm tắt
          </span>
        </div>
        <p className="mt-1 truncate text-[11.5px] text-white/80">
          Meta-analysis: volume &amp; hypertrophy
        </p>
      </div>

      <div className="mt-2 flex items-center justify-between gap-1 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2">
        {PHASES.map((phase, index) => (
          <span key={phase} className="flex items-center gap-1">
            <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-white/50">
              {phase}
            </span>
            {index < PHASES.length - 1 && (
              <Icon name="arrowRight" className="h-2.5 w-2.5 text-pine-300/60" />
            )}
          </span>
        ))}
      </div>
    </PageShell>
  );
}

function ResearchMock() {
  return (
    <PageShell icon="book" kicker="Nghiên cứu / Reader" badge="AI">
      <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-white/45">Bài đang đọc</p>
      <h3 className="mt-1 text-[15px] font-semibold leading-snug text-white/90">
        Volume &amp; hypertrophy: meta-analysis
      </h3>
      <p className="mt-1 font-mono text-[8.5px] text-white/35">12 nguồn · PubMed / PMC</p>

      <div className="mt-3 rounded-lg border border-pine-300/20 bg-pine-400/[0.06] p-2.5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-pine-200/80">
            AI tóm tắt
          </p>
          <span className="font-mono text-[8px] text-pine-200">Đang đọc</span>
        </div>
        <p className="mt-1.5 text-[10.5px] leading-relaxed text-white/65">
          10–20 set/nhóm cơ/tuần cho hypertrophy; tăng dần volume và giữ kỹ thuật.
        </p>
        <div className="mt-2 flex gap-1.5">
          <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 font-mono text-[7.5px] text-white/45">
            Mức 1
          </span>
          <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 font-mono text-[7.5px] text-white/45">
            Open access
          </span>
        </div>
      </div>

      <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
        <p className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-white/45">
          Hỏi đáp trên bài
        </p>
        <p className="mt-1 text-[10.5px] text-white/70">“Tôi nên tăng volume thế nào?”</p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
          <span className="research-scan block h-full w-1/3 rounded-full bg-pine-300" />
        </div>
      </div>
    </PageShell>
  );
}

function TrainingMock() {
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const exercises = [
    ['Back squat', '4 × 6', '120 kg'],
    ['Romanian deadlift', '3 × 8', '90 kg'],
    ['Barbell row', '3 × 10', '60 kg'],
  ];
  return (
    <PageShell icon="dumbbell" kicker="Giáo án / Tuần 4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-white/45">
          Lịch tuần
        </p>
        <span className="font-mono text-[8px] text-pine-200">Upper / Lower</span>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <span
            key={day}
            className={`grid h-7 place-items-center rounded-md border font-mono text-[8px] ${
              index === 2
                ? 'border-pine-300/40 bg-pine-400/15 text-pine-200'
                : 'border-white/10 bg-white/[0.03] text-white/45'
            }`}
          >
            {day}
          </span>
        ))}
      </div>

      <div className="mt-3 space-y-1.5">
        {exercises.map(([name, sets, load]) => (
          <div
            key={name}
            className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-[10.5px] text-white/80">{name}</p>
              <p className="font-mono text-[8px] text-white/35">{sets}</p>
            </div>
            <span className="shrink-0 font-mono text-[9px] text-pine-200">{load}</span>
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
          <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/45">Volume</p>
          <p className="mt-0.5 font-display text-[16px]">14 set</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
          <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/45">Thời lượng</p>
          <p className="mt-0.5 font-display text-[16px]">62 phút</p>
        </div>
      </div>
    </PageShell>
  );
}

function NutritionMock() {
  return (
    <PageShell icon="utensils" kicker="Dinh dưỡng / Hôm nay">
      <div className="flex items-center gap-4">
        <div className="relative h-[92px] w-[92px] shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="41" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="41"
              fill="none"
              style={{ stroke: 'rgb(var(--ts-accent-400))' }}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="258"
              strokeDashoffset="64"
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-center">
            <span className="font-display text-[18px] leading-none">2.180</span>
            <span className="font-mono text-[7px] uppercase tracking-[0.08em] text-white/40">kcal</span>
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-white/45">
            Mục tiêu 2.450 kcal
          </p>
          <div className="mt-2 space-y-1.5">
            {[
              ['Protein', '152 g', 'w-[78%]'],
              ['Carbs', '268 g', 'w-[64%]'],
              ['Fat', '72 g', 'w-[52%]'],
            ].map(([label, value, width]) => (
              <div key={label}>
                <div className="flex justify-between font-mono text-[7.5px] text-white/40">
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
                <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-white/10">
                  <span className={`block h-full rounded-full bg-pine-300 ${width}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {[
          ['Sáng', 'Yến mạch, trứng, chuối'],
          ['Trưa', 'Cơm gà, rau xanh'],
          ['Chiều', 'Sữa chua Hy Lạp, hạt'],
        ].map(([meal, text]) => (
          <div
            key={meal}
            className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2"
          >
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-pine-200/75">
              {meal}
            </span>
            <span className="truncate text-[10px] text-white/65">{text}</span>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function LearnMock() {
  return (
    <PageShell icon="notebook" kicker="Học tập / Module 03">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-white/45">
          Tiến độ module
        </p>
        <span className="font-mono text-[9px] text-pine-200">72%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <span className="block h-full w-[72%] rounded-full bg-pine-300" />
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
        <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/45">
          Flashcard · Chu kỳ cơ
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-white/75">
          Vì sao tăng volume quá nhanh dễ làm giảm hiệu suất?
        </p>
        <div className="mt-2 flex gap-1.5">
          <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 font-mono text-[7.5px] text-white/45">
            Lật thẻ
          </span>
          <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 font-mono text-[7.5px] text-white/45">
            Ôn hôm nay
          </span>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
          <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/45">Quiz</p>
          <p className="mt-0.5 font-display text-[16px]">8/10</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
          <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/45">Chuỗi ngày</p>
          <p className="mt-0.5 font-display text-[16px]">6 ngày</p>
        </div>
      </div>
    </PageShell>
  );
}

const PAGE_META = [
  { label: 'Tổng quan', icon: 'dashboard' },
  { label: 'Nghiên cứu', icon: 'book' },
  { label: 'Giáo án', icon: 'dumbbell' },
  { label: 'Dinh dưỡng', icon: 'utensils' },
  { label: 'Học tập', icon: 'notebook' },
];

const PAGE_CARDS = [
  <DashboardMock key="dashboard" />,
  <ResearchMock key="research" />,
  <TrainingMock key="training" />,
  <NutritionMock key="nutrition" />,
  <LearnMock key="learn" />,
];

function TiltDeck({ children, rotate = 2.6 }) {
  const reduceMotion = useReducedMotion();
  const tiltX = useSpring(0, { stiffness: 200, damping: 22, mass: 0.5 });
  const tiltY = useSpring(0, { stiffness: 200, damping: 22, mass: 0.5 });
  const lift = useSpring(0, { stiffness: 220, damping: 24, mass: 0.6 });
  const scale = useSpring(1, { stiffness: 220, damping: 24, mass: 0.6 });
  const glow = useSpring(0, { stiffness: 140, damping: 26 });
  const glowX = useSpring(50, { stiffness: 120, damping: 24 });
  const glowY = useSpring(50, { stiffness: 120, damping: 24 });
  const glare = useMotionTemplate`radial-gradient(54% 54% at ${glowX}% ${glowY}%, rgba(206, 244, 228, 0.12), transparent 72%)`;

  const reset = () => {
    tiltX.set(0);
    tiltY.set(0);
    lift.set(0);
    scale.set(1);
    glow.set(0);
    glowX.set(50);
    glowY.set(50);
  };

  const handleEnter = event => {
    if (reduceMotion || event.pointerType === 'touch') return;
    lift.set(-5);
    scale.set(1.012);
    glow.set(1);
  };

  const handleMove = event => {
    if (reduceMotion || event.pointerType === 'touch' || event.buttons !== 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const px = Math.max(
      -0.5,
      Math.min(0.5, (event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5)
    );
    const py = Math.max(
      -0.5,
      Math.min(0.5, (event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5)
    );
    lift.set(-5);
    scale.set(1.012);
    glow.set(1);
    tiltY.set(px * 18);
    tiltX.set(-py * 14);
    glowX.set(50 + px * 64);
    glowY.set(50 + py * 64);
  };

  return (
    <div
      className="h-full w-full [perspective:1400px]"
      onPointerEnter={handleEnter}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d] will-change-transform"
        style={{ rotate, rotateX: tiltX, rotateY: tiltY, y: lift, scale }}
      >
        {children}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-40 rounded-[clamp(14px,calc(20px*var(--ts-radius,1)),30px)] mix-blend-screen"
          style={{ background: glare, opacity: glow }}
        />
      </motion.div>
    </div>
  );
}

export default function Welcome() {
  const { user, completeWelcome } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [activeFeature, setActiveFeature] = useState(0);
  const [activePage, setActivePage] = useState(0);
  const feature = FEATURES[activeFeature] || FEATURES[0];

  const start = async () => {
    setError('');
    if (!user) {
      navigate('/register');
      return;
    }
    setBusy(true);
    try {
      if (user.onboardingRequired) await completeWelcome();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  };

  const primaryLabel = busy
    ? 'Đang mở...'
    : user
      ? user.onboardingRequired
        ? 'Bắt đầu theo dõi'
        : 'Vào tổng quan'
      : 'Tạo tài khoản';

  return (
    <div
      id="top"
      className="min-h-screen text-slate-900 dark:text-slate-100"
    >
      <LandingHeader
        user={user}
        isDark={isDark}
        onToggleTheme={toggle}
        onStart={start}
        busy={busy}
        primaryLabel={primaryLabel}
      />

      <main>
        <section className="relative isolate overflow-hidden bg-shell text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,#07110d_0%,#0a1a14_44%,#07110d_100%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(95,191,158,0.18),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(193,146,52,0.12),transparent_30%),radial-gradient(circle_at_76%_86%,rgba(14,107,82,0.16),transparent_36%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(to_right,rgba(232,229,219,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(232,229,219,0.18)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_40%_36%,black_8%,transparent_72%)]"
          />

          <div className="relative z-10 mx-auto grid w-full max-w-[1280px] items-center gap-10 px-4 pb-8 pt-12 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-12 lg:pt-20">
            <div className="max-w-[44rem]">
              <div className="hero-reveal flex items-center gap-3" style={{ animationDelay: '40ms' }}>
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                  <span className="absolute inset-0 rounded-md bg-pine-400/25 blur-md" aria-hidden="true" />
                  <img src="/logo-mark.png" alt="" className="relative h-11 w-11 rounded-md" />
                </span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-pine-300">
                  PT Brain · Evidence-based training
                </span>
              </div>

              <h1
                className="hero-reveal mt-6 max-w-[17ch] font-display text-[36px] leading-[1.04] tracking-[-0.02em] sm:text-[52px] lg:text-[58px]"
                style={{ animationDelay: '110ms' }}
              >
                Biến nghiên cứu và dữ liệu cơ thể thành một giáo án bạn thực sự hiểu.
              </h1>
              <p
                className="hero-reveal mt-5 max-w-[56ch] text-[14px] leading-relaxed text-white/72 sm:text-[15.5px]"
                style={{ animationDelay: '190ms' }}
              >
                PT Brain gom việc đọc bài báo, tính chỉ số, theo dõi cân nặng – số đo – cardio và
                lên giáo án vào một chỗ. Không phải một app ghi chép thêm, mà là một vòng lặp học →
                áp dụng → đo lại.
              </p>

              <div
                className="hero-reveal mt-8 flex flex-wrap items-center gap-2.5"
                style={{ animationDelay: '270ms' }}
              >
                <button
                  type="button"
                  className="btn-primary h-11 border-white/10 bg-pine-500 px-4 text-[13px] text-pine-950 hover:bg-pine-400"
                  onClick={start}
                  disabled={busy}
                >
                  {primaryLabel}
                  <Icon name="arrowRight" className="h-4 w-4" />
                </button>
                <a
                  href="#chuc-nang"
                  className="btn-secondary h-11 border-white/20 bg-white/10 px-4 text-[13px] text-white shadow-none hover:bg-white/15"
                >
                  Xem cách hoạt động
                  <Icon name="chevronDown" className="h-4 w-4" />
                </a>
              </div>

              {user?.onboardingRequired && (
                <p
                  className="hero-reveal mt-4 text-xs text-pine-200/90"
                  style={{ animationDelay: '330ms' }}
                >
                  Chào mừng tài khoản mới. Bạn có thể xem nhanh trang này trước khi vào Tổng quan.
                </p>
              )}
            </div>

            <div className="hero-reveal relative mx-auto w-full max-w-[560px]" style={{ animationDelay: '210ms' }}>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-6 bg-[radial-gradient(circle_at_50%_30%,rgba(95,191,158,0.16),transparent_58%)]"
              />
              <div className="relative z-[1] h-[470px] w-full pb-[70px] pt-6">
                <TiltDeck>
                  <Stack
                    cards={PAGE_CARDS}
                    layout="spill"
                    visible={4}
                    spread={0.58}
                    depth={0.2}
                    radius={20}
                    frame={1}
                    frameColor="rgba(232, 229, 219, 0.16)"
                    tilt={10}
                    speed={0.9}
                    sendToBackOnClick
                    onChange={setActivePage}
                    label="Các trang của PT Brain"
                    describedBy="hero-stack-help"
                    className="h-full w-full"
                  />
                </TiltDeck>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <p
                  className="font-mono text-[9.5px] uppercase tracking-[0.13em] text-white/50"
                  aria-live="polite"
                >
                  Trang {activePage + 1} / {PAGE_META.length} ·{' '}
                  <span className="text-pine-200/85">
                    {(PAGE_META[activePage] || PAGE_META[0]).label}
                  </span>
                </p>
                <div className="flex items-center gap-1" aria-hidden="true">
                  {PAGE_META.map((page, index) => (
                    <span
                      key={page.label}
                      className={`h-[2px] w-4 rounded-full transition-colors duration-300 ${
                        index === activePage ? 'bg-pine-300' : 'bg-white/25'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p
                id="hero-stack-help"
                className="mt-1.5 text-center font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/50"
              >
                Nhấn để lật trang · kéo để ném thẻ
                <span className="sr-only">
                  Khi thẻ đang được chọn, dùng phím mũi tên hoặc Enter để chuyển trang.
                </span>
              </p>
            </div>
          </div>

          <div className="relative z-10 mx-auto grid w-full max-w-[1280px] grid-cols-2 border-t border-white/10 sm:grid-cols-4">
            {HERO_STATS.map(([label, value]) => (
              <div key={label} className="border-r border-white/10 px-4 py-3.5 last:border-r-0 sm:px-6">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-pine-300/75">
                  {label}
                </p>
                <p className="mt-1 text-[12px] font-medium text-white/88">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {error && (
          <div className="mx-auto w-full max-w-[1280px] px-4 pt-5 sm:px-6 lg:px-8">
            <Alert tone="danger">{error}</Alert>
          </div>
        )}

        <section
          id="muc-dich"
          className="mx-auto grid w-full max-w-[1280px] scroll-mt-24 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:px-8 lg:py-24"
        >
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-pine-700 dark:text-pine-300">
              Mục đích
            </p>
            <h2 className="mt-3 max-w-[22ch] font-display text-[30px] leading-[1.1] tracking-[-0.02em] text-slate-900 dark:text-white sm:text-[38px]">
              Một nơi để trả lời: “Tôi nên tập gì, ăn gì và đo gì tiếp theo?”
            </h2>
            <p className="mt-4 max-w-[58ch] text-[14px] leading-relaxed text-slate-600 dark:text-slate-300">
              Phần lớn người tập phải mở quá nhiều tab: một trang đọc paper, một app đếm calo, một
              file Excel cân nặng và một ứng dụng ghi set. PT Brain nối chúng lại để mỗi quyết định
              đều có dữ liệu phía sau.
            </p>

            <div className="mt-8 divide-y divide-line border-y border-line dark:divide-white/10 dark:border-white/10">
              {PRINCIPLES.map(([title, text], index) => (
                <div key={title} className="grid grid-cols-[34px_minmax(0,1fr)] gap-3 py-4">
                  <span className="pt-0.5 font-mono text-[11px] font-semibold text-pine-600 dark:text-pine-300">
                    0{index + 1}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                      {title}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-[420px]">
            <TiltedCard
              imageSrc={protocolCardImage}
              altText="PT Brain protocol: Đọc, Hiểu, Áp dụng, Đo lại"
              containerWidth="100%"
              containerHeight="520px"
              imageWidth="100%"
              imageHeight="520px"
              radius={24}
              glare={0.45}
              shadow={0.5}
              showTooltip={false}
              flipOnClick={false}
              intro={false}
              className="mx-auto"
            />
            <p className="mt-3 text-center font-mono text-[9.5px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Vòng lặp 4 pha · Đọc → Hiểu → Áp dụng → Đo lại
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div className="grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-[28px] leading-tight tracking-[-0.015em] text-slate-900 dark:text-white sm:text-[34px]">
                  Vòng lặp huấn luyện 4 pha
                </h2>
                <span className="rounded-full border border-pine-200 bg-pine-50 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-pine-700 dark:border-pine-800 dark:bg-pine-950/40 dark:text-pine-300">
                  Chu trình khép kín
                </span>
              </div>

              <ol className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {PHASES.map((label, index) => (
                  <li
                    key={label}
                    className="rounded-xl border border-line bg-surface px-3 py-3 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <span className="font-mono text-[10px] text-pine-600 dark:text-pine-300">
                      0{index + 1}
                    </span>
                    <p className="mt-1 text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                      {label}
                    </p>
                  </li>
                ))}
              </ol>

              <div className="mt-5 rounded-xl border border-pine-200/80 bg-pine-50/60 p-4 dark:border-pine-800/50 dark:bg-pine-950/20">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-pine-700 dark:text-pine-300">
                  Ví dụ một vòng lặp thực tế
                </p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-slate-600 dark:text-slate-300">
                  Đọc một meta-analysis về volume → chọn tăng 2 set/tuần cho nhóm cơ yếu → log 4
                  tuần → so volume, cân nặng và cảm giác hồi phục rồi điều chỉnh.
                </p>
              </div>

              <div className="mt-5 border-t border-line pt-4 dark:border-white/10">
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                  Không cần làm tất cả ngay từ ngày đầu
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Bắt đầu bằng cân nặng và một buổi tập. Khi đã quen, thêm nghiên cứu, dinh dưỡng và
                  theo dõi cardio. Trang này chỉ hiển thị khi bạn mở địa chỉ trang web.
                </p>
              </div>
            </div>

            <div className="relative mx-auto h-[390px] w-full max-w-[560px] sm:h-[450px]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,107,82,0.13),transparent_64%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(95,191,158,0.12),transparent_64%)]"
              />
              <InfiniteSpiral
                items={phaseSpiralItems}
                speed={0.34}
                direction="up"
                animationMode="auto"
                radius={155}
                cardWidth={150}
                cardHeight={150}
                cardRadius={16}
                cardsPerTurn={4}
                verticalSpacing={72}
                centerScale={1.15}
                edgeFade={0.2}
                edgeBlur={4}
                pauseOnHover
                className="h-full w-full"
              />
              <div className="pointer-events-none absolute inset-x-1 bottom-0 flex justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                <span>Tự xoay</span>
                <span>04 phase loop</span>
              </div>
            </div>
          </div>
        </section>

        <section
          id="chuc-nang"
          className="mx-auto w-full max-w-[1280px] scroll-mt-24 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24"
        >
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4 dark:border-white/10">
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-pine-700 dark:text-pine-300">
                Cách hoạt động
              </p>
              <h2 className="mt-2 font-display text-[30px] leading-[1.1] tracking-[-0.02em] text-slate-900 dark:text-white sm:text-[36px]">
                Bốn bước để biến dữ liệu thành tiến bộ
              </h2>
            </div>
            <p className="max-w-md text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
              Mỗi bước đều có dữ liệu đầu vào rõ ràng. Bạn có thể bắt đầu ở bất kỳ mục nào.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STEPS.map((step, index) => {
              const tilt = [-2.4, 1.8, -1.6, 2.2][index] ?? 0;
              return (
                <div
                  key={step.number}
                  className="relative"
                  style={{ transform: `rotate(${tilt}deg)` }}
                >
                  <TiltedCard
                    containerWidth="100%"
                    containerHeight="356px"
                    imageWidth="100%"
                    imageHeight="356px"
                    radius={20}
                    glare={0.35}
                    shadow={0.45}
                    showTooltip={false}
                    flipOnClick={false}
                    intro={false}
                    rotateAmplitude={14}
                    className="w-full"
                  >
                    <div
                      className="absolute inset-0 z-[2] flex flex-col justify-between p-5 text-white"
                      style={{ background: STEP_BACKGROUNDS[index] }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-white/75">
                          Bước {step.number}
                        </span>
                        <span className="grid h-8 w-8 place-items-center rounded-md border border-white/12 bg-white/[0.06] text-pine-200">
                          <Icon name={step.icon} className="h-4 w-4" />
                        </span>
                      </div>
                      <StepArt type={step.art} className="text-pine-200/75" />
                      <div>
                        <h3 className="font-display text-[18px] font-semibold leading-tight">
                          {step.title}
                        </h3>
                        <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/65">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  </TiltedCard>
                </div>
              );
            })}
          </div>

          <div className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4 dark:border-white/10">
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-pine-700 dark:text-pine-300">
                  Module
                </p>
                <h2 className="mt-2 font-display text-[30px] leading-[1.1] tracking-[-0.02em] text-slate-900 dark:text-white sm:text-[36px]">
                  Sáu module, một vòng lặp
                </h2>
              </div>
              <p className="max-w-md text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
                Kéo gallery hoặc dùng phím ← → để xem từng module. Mọi module đều dùng chung một hồ
                sơ và một dòng thời gian.
              </p>
            </div>

            <div className="mt-6 overflow-hidden rounded-[clamp(20px,calc(32px*var(--ts-radius,1)),44px)] border border-white/10 bg-shell text-white">
              <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
                <div className="relative h-[440px] sm:h-[520px]">
                  <CircularGallery
                    items={featureGalleryItems}
                    textColor="#f5f6f2"
                    font="600 17px 'Be Vietnam Pro', sans-serif"
                    fontUrl=""
                    borderRadius={0.05}
                    gap={0.2}
                    bend={4}
                    wave={1.1}
                    itemAspect={0.72}
                    autoScroll={0.16}
                    showTitles
                    openOnClick={false}
                    intro
                    onActiveChange={setActiveFeature}
                    className="h-full w-full"
                  />
                </div>

                <div className="flex flex-col justify-center border-t border-white/10 p-6 lg:border-l lg:border-t-0 lg:p-8">
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-pine-300/75">
                    Module 0{activeFeature + 1} / 06
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-md border border-white/12 bg-white/[0.06] text-pine-200">
                      <Icon name={feature.icon} className="h-4 w-4" />
                    </span>
                    <h3 className="font-display text-[24px] font-semibold leading-tight">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="mt-3 max-w-[46ch] text-[13px] leading-relaxed text-white/65">
                    {feature.text}
                  </p>
                  <FeatureArt type={feature.art} className="mt-6 text-pine-200/70" />
                  <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.12em] text-white/35">
                    {activeFeature + 1} / {FEATURES.length} · kéo hoặc ← → để đổi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="bat-dau"
          className="mx-auto w-full max-w-[1280px] scroll-mt-24 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24"
        >
          <div className="grid gap-4 lg:grid-cols-[1.06fr_0.94fr]">
            <div className="relative overflow-hidden rounded-[clamp(20px,calc(32px*var(--ts-radius,1)),44px)] bg-shell p-6 text-white sm:p-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(95,191,158,0.18),transparent_38%),radial-gradient(circle_at_92%_88%,rgba(193,146,52,0.14),transparent_40%)]"
              />
              <div className="relative">
                <h2 className="max-w-[20ch] font-display text-[28px] leading-[1.1] tracking-[-0.02em] sm:text-[34px]">
                  Bắt đầu theo dõi quá trình tập luyện
                </h2>
                <p className="mt-3 max-w-[50ch] text-[13.5px] leading-relaxed text-white/68">
                  Chỉ cần 3 bước. Dữ liệu của bạn chỉ bạn thấy, có thể xuất CSV/PDF hoặc xóa toàn bộ
                  bất cứ lúc nào.
                </p>
                <button
                  type="button"
                  className="btn-primary mt-6 h-11 border-white/10 bg-pine-500 px-4 text-[13px] text-pine-950 hover:bg-pine-400"
                  onClick={start}
                  disabled={busy}
                >
                  {primaryLabel}
                  <Icon name="arrowRight" className="h-4 w-4" />
                </button>
              </div>
            </div>

            <TiltedCard
              containerWidth="100%"
              containerHeight="420px"
              imageWidth="100%"
              imageHeight="420px"
              radius={22}
              glare={0.28}
              shadow={0.35}
              showTooltip={false}
              flipOnClick={false}
              intro={false}
              className="w-full"
            >
              <div className="absolute inset-0 z-[2] flex flex-col justify-between bg-[linear-gradient(145deg,#f5f6f2_0%,#e8e5db_100%)] p-5 text-slate-900 dark:bg-[linear-gradient(145deg,#101612_0%,#171f1b_100%)] dark:text-white">
                <div>
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-pine-700 dark:text-pine-300">
                    Ba bước đầu tiên
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {START_STEPS.map(([number, title, text]) => (
                      <div
                        key={number}
                        className="grid grid-cols-[26px_minmax(0,1fr)] gap-2 border-b border-line/80 pb-2.5 last:border-0 last:pb-0 dark:border-white/10"
                      >
                        <span className="pt-0.5 font-mono text-[10px] font-semibold text-pine-600 dark:text-pine-300">
                          {number}
                        </span>
                        <div>
                          <p className="text-[12.5px] font-semibold">{title}</p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                            {text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-4 text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Chỉ số và gợi ý chỉ mang tính ước lượng, không thay thế bác sĩ, PT hoặc chuyên gia
                  dinh dưỡng. Bản tóm tắt AI có thể sai — hãy đối chiếu bài gốc với kết luận quan
                  trọng.
                </p>
              </div>
            </TiltedCard>
          </div>
        </section>
      </main>

      <footer className="border-t border-line dark:border-white/10">
        <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <img src="/logo-mark.png" alt="" className="h-7 w-7 rounded" />
            <span className="font-display text-[14px] font-semibold text-slate-900 dark:text-white">
              PT Brain
            </span>
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 sm:inline">
              Evidence-based coaching
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11.5px] text-slate-500 dark:text-slate-400">
            <a href="#muc-dich" className="hover:text-slate-900 dark:hover:text-white">
              Mục đích
            </a>
            <a href="#chuc-nang" className="hover:text-slate-900 dark:hover:text-white">
              Cách hoạt động
            </a>
            {user ? (
              <button
                type="button"
                onClick={start}
                disabled={busy}
                className="font-semibold text-pine-700 disabled:opacity-60 dark:text-pine-300"
              >
                {primaryLabel}
              </button>
            ) : (
              <>
                <Link to="/login" className="hover:text-slate-900 dark:hover:text-white">
                  Đăng nhập
                </Link>
                <Link to="/register" className="font-semibold text-pine-700 dark:text-pine-300">
                  Tạo tài khoản
                </Link>
              </>
            )}
          </div>
          <p className="w-full font-mono text-[9px] uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 sm:w-auto">
            PT Brain · 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
