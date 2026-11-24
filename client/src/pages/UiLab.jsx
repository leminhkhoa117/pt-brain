import { Badge, Icon, PageHeader, Panel } from '../components/ui.jsx';
import { useTheme } from '../hooks/useTheme.jsx';
import SplitText from '../components/reactbits/SplitText/SplitText.jsx';
import CountUp from '../components/reactbits/CountUp/CountUp.jsx';
import SpotlightCard from '../components/reactbits/SpotlightCard/SpotlightCard.jsx';
import AnimatedContent from '../components/reactbits/AnimatedContent/AnimatedContent.jsx';

const INSTALLED = [
  {
    name: 'SplitText',
    dependency: 'gsap · @gsap/react',
    icon: 'bolt',
    blurb:
      'Chia tiêu đề thành từ hoặc ký tự rồi cho trượt / blur / pop khi vào khung nhìn. Phù hợp hero, tiêu đề module và landing.',
    accent: 'Tiêu đề có nhịp',
  },
  {
    name: 'CountUp',
    dependency: 'motion',
    icon: 'activity',
    blurb:
      'Đếm số có easing, hỗ trợ compact, separator, prefix / suffix và trigger theo viewport. Hợp với dashboard chỉ số.',
    accent: 'Số liệu sống',
  },
  {
    name: 'SpotlightCard',
    dependency: 'không dependency',
    icon: 'cards',
    blurb:
      'Card có đèn theo con trỏ, viền sáng và grain tuỳ chọn. Nhẹ, không WebGL, dễ đổi màu theo token của app.',
    accent: 'Điểm nhấn chuột',
  },
];

const NEXT_STEPS = [
  ['AnimatedList', 'Danh sách bài tập / lịch sử set, có snap và bàn phím.'],
  ['Stepper', 'Onboarding, body assessment hoặc luồng tạo giáo án nhiều bước.'],
  ['PulseHeart', 'Nút yêu thích bài học / món ăn với count nhảy.'],
  ['SquishSwitch · SlideCommit', 'Settings, bật tắt nhắc nhở, xác nhận thao tác.'],
  ['MagicBento', 'Dashboard feature grid nếu cần bản bento nổi bật hơn.'],
];

const cardVars = (isDark) => ({
  '--spotlight-card-surface': isDark ? '#151b18' : '#fefffc',
  '--spotlight-card-border': isDark ? 'rgba(255,255,255,0.09)' : '#d8ddd4',
  '--spotlight-card-shadow': isDark
    ? '0 24px 48px -24px rgba(0,0,0,0.65)'
    : '0 1px 2px rgba(24,24,27,0.04), 0 18px 40px -20px rgba(24,24,27,0.16)',
});

export default function UiLab() {
  const { isDark } = useTheme();
  const vars = cardVars(isDark);
  const spotlight = isDark ? '#5fbf9e' : '#0e6b52';

  return (
    <div className="space-y-6">
      <PageHeader
        title="React Bits Lab"
        subtitle="Khảo sát cách dùng React Bits trong PT Brain: component source, dependency, biến thể JS/TW và cách giữ đúng ngôn ngữ thiết kế của app."
        meta={
          <>
            <span>React Bits · 215+ component</span>
            <span className="text-line-strong dark:text-white/20">/</span>
            <span>JS + Tailwind</span>
            <span className="text-line-strong dark:text-white/20">/</span>
            <span>GSAP · Motion</span>
          </>
        }
        actions={
          <a
            href="https://reactbits.dev/get-started/index"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            Mở catalog
            <Icon name="external" className="h-3.5 w-3.5" />
          </a>
        }
      />

      <section className="panel overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-12">
          <div className="p-6 sm:p-8 lg:col-span-7">
            <Badge tone="pine">Sandbox</Badge>
            <div className="mt-4">
              <SplitText
                text="Giao diện sống động, vẫn đúng chất PT Brain."
                tag="h2"
                splitType="words"
                effect="rise"
                delay={38}
                duration={0.85}
                trigger="load"
                className="max-w-[20ch] font-display text-[30px] font-semibold leading-[1.08] tracking-[-0.02em] text-slate-900 dark:text-slate-50 sm:text-[38px]"
              />
            </div>
            <p className="mt-4 max-w-[58ch] text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
              React Bits không phải package UI đóng gói sẵn: mỗi component là source bạn sở hữu.
              Trang này đã thử 10 component — chữ, số, card, reveal, loader và 5 component 3D — rồi
              ghi lại cách thêm component mới.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="badge badge-pine">Source-first</span>
              <span className="badge badge-neutral">Tailwind</span>
              <span className="badge badge-neutral">MIT + Commons Clause</span>
              <span className="badge badge-warn">Không WebGL</span>
            </div>
          </div>

          <div className="border-t border-line bg-paper-2/50 p-6 dark:border-white/[0.08] dark:bg-white/[0.02] lg:col-span-5 lg:border-l lg:border-t-0">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
              Cài một component
            </p>
            <pre className="mt-3 overflow-x-auto rounded-md bg-[#0e1713] p-4 font-mono text-[11px] leading-relaxed text-[#e8e5db]">
              <code>
                {'npm install motion gsap @gsap/react\n'}
                {'node scripts/add-reactbits.mjs CountUp\n\n'}
                {'# hoặc dùng shadcn CLI\n'}
                {'npx shadcn@latest add @react-bits/CountUp-JS-TW'}
              </code>
            </pre>
            <p className="mt-3 text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-400">
              Helper <code className="font-mono text-[10.5px]">scripts/add-reactbits.mjs</code>{' '}
              tải đúng file từ registry và in ra dependency cần cài.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Thống kê thư viện">
        {[
          {
            label: 'Component',
            to: 215,
            suffix: '+',
            note: 'text, animations, components, micro, backgrounds',
          },
          { label: 'Nhóm', to: 5, note: '5 nhóm chính trong catalog' },
          {
            label: 'Đang cài',
            to: 10,
            note: '5 UI + 5 3D: Orb · FluidGlass · TiltedCard · CircularGallery · InfiniteSpiral',
          },
        ].map((item) => (
          <div key={item.label} className="metric">
            <p className="metric-label">{item.label}</p>
            <p className="metric-value text-slate-900 dark:text-slate-50">
              <CountUp
                to={item.to}
                duration={1.5}
                trigger="load"
                suffix={item.suffix || ''}
                className="tabular-nums"
              />
            </p>
            <p className="metric-note">{item.note}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="installed-title">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="installed-title"
              className="font-display text-[22px] font-semibold tracking-[-0.015em] text-slate-900 dark:text-slate-50"
            >
              Component đang chạy
            </h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-400">
              3 card nổi bật bên dưới; LatticeLoader ở Research; TiltedCard + CircularGallery +
              Stack + InfiniteSpiral ở trang giới thiệu.
            </p>
          </div>
          <Badge tone="neutral">10 component · JS-TW</Badge>
        </div>

        <AnimatedContent
          distance={34}
          duration={0.6}
          ease="power2.out"
          stagger={0.08}
          threshold={0.15}
          trigger="mount"
          once
          className="grid gap-4 md:grid-cols-3"
        >
          {INSTALLED.map((item) => (
            <SpotlightCard
              key={item.name}
              theme={isDark ? 'dark' : 'light'}
              spotlightColor={spotlight}
              intensity={0.2}
              spotlightSize={250}
              borderGlow={0.55}
              className="h-full"
              style={{ ...vars, padding: 24 }}
            >
              <div className="flex h-full flex-col">
                <span className="grid h-9 w-9 place-items-center rounded-md border border-line bg-paper-2 text-pine-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-pine-300">
                  <Icon name={item.icon} className="h-4 w-4" />
                </span>
                <p className="mt-4 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                  {item.accent}
                </p>
                <h3 className="mt-1 font-display text-[20px] font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-50">
                  {item.name}
                </h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.blurb}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                  <span className="badge badge-neutral font-mono">{item.dependency}</span>
                  {item.name === 'CountUp' ? (
                    <CountUp
                      to={128}
                      duration={1.2}
                      trigger="load"
                      suffix=" bài"
                      className="font-mono text-[11px] text-pine-700 dark:text-pine-300"
                    />
                  ) : null}
                </div>
              </div>
            </SpotlightCard>
          ))}
        </AnimatedContent>
      </section>

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          title="Cách dùng trong dự án này"
          note="Quy trình đã kiểm chứng với Vite + React 18 + Tailwind 3."
          className="lg:col-span-7"
        >
          <ol className="space-y-3">
            {[
              [
                'Chọn đúng biến thể',
                'Dự án dùng JavaScript + Tailwind nên chọn hậu tố JS-TW. Nếu lấy TS-CSS, bạn sẽ phải đổi type và viết CSS riêng.',
              ],
              [
                'Tải source',
                'Dùng helper scripts/add-reactbits.mjs hoặc shadcn CLI. File vào src/components/reactbits/<Tên>/<Tên>.jsx.',
              ],
              [
                'Cài dependency',
                'Mỗi component khai báo dependency riêng: CountUp cần motion; SplitText/AnimatedContent cần gsap; SpotlightCard và LatticeLoader không cần gì.',
              ],
              [
                'Đổi sang token PT Brain',
                'Truyền className/style, thay màu neon bằng pine/ochre/paper. Giữ bo góc, border và typography của app.',
              ],
              [
                'Kiểm tra cleanup + reduced motion',
                'Các component dùng GSAP/Motion đều có cleanup; vẫn cần test prefers-reduced-motion và tab ẩn.',
              ],
            ].map(([title, body], index) => (
              <li key={title} className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line bg-paper-2 font-mono text-[10px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                  {index + 1}
                </span>
                <div>
                  <p className="text-[12.5px] font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                  </p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600 dark:text-slate-400">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>

        <div className="space-y-4 lg:col-span-5">
          <Panel title="Nên thử tiếp" note="Ưu tiên component phục vụ luồng học/tập.">
            <ul className="space-y-2.5">
              {NEXT_STEPS.map(([name, note]) => (
                <li key={name} className="flex gap-2.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-pine-600 dark:bg-pine-300" />
                  <p className="text-[12px] leading-relaxed text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {name}
                    </span>{' '}
                    — {note}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="panel p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-ochre-200 bg-ochre-50 text-ochre-700 dark:border-ochre-800/60 dark:bg-ochre-900/25 dark:text-ochre-200">
                <Icon name="alert" className="h-4 w-4" />
              </span>
              <div>
                <p className="font-display text-[15px] font-semibold text-slate-900 dark:text-slate-50">
                  Đừng dùng cả catalog
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-600 dark:text-slate-400">
                  React Bits mạnh ở điểm nhấn. Một trang dữ liệu dày chỉ nên có 1–2 hiệu ứng
                  chuyển động; background shader và cursor effect toàn cục dễ làm chậm và lệch
                  ngôn ngữ thiết kế.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
