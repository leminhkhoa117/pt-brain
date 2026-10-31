import { NavLink, Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useTheme } from '../hooks/useTheme.jsx';
import { Icon } from './ui.jsx';
import BrandLogo from './BrandLogo.jsx';
import { initials } from '../lib/format.js';

const NAV_GROUPS = [
  {
    label: 'Tổng quan',
    items: [
      { to: '/', label: 'Tổng quan', icon: 'dashboard', end: true },
      { to: '/body-log', label: 'Theo dõi cơ thể', icon: 'activity' },
    ],
  },
  {
    label: 'Nghiên cứu',
    items: [{ to: '/research', label: 'Research Reader', icon: 'book' }],
  },
  {
    label: 'Huấn luyện',
    items: [{ to: '/training', label: 'Giáo án & buổi tập', icon: 'dumbbell' }],
  },
  {
    label: 'Kiến thức',
    items: [
      { to: '/learn', label: 'Học tập', icon: 'notebook' },
      { to: '/clients', label: 'Khách hàng', icon: 'users' },
    ],
  },
  {
    label: 'Công cụ',
    items: [
      { to: '/calculators', label: 'Máy tính chỉ số', icon: 'calculator' },
      { to: '/settings', label: 'Cài đặt', icon: 'settings' },
    ],
  },
];

const FLAT_NAV = NAV_GROUPS.flatMap((group) => group.items);
const MOBILE_PATHS = ['/', '/body-log', '/research', '/training', '/learn'];
const MOBILE_NAV = FLAT_NAV.filter((item) => MOBILE_PATHS.includes(item.to));

function NavItem({ item, compact = false }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        clsx(
          'group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-semibold transition',
          isActive
            ? 'bg-gradient-to-r from-brand-500/[0.14] to-teal-400/[0.05] text-brand-800 ring-1 ring-brand-500/15 dark:from-brand-400/[0.18] dark:to-teal-300/[0.04] dark:text-brand-200 dark:ring-brand-400/15'
            : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white',
          compact && 'flex-col gap-1 rounded-lg px-1 py-1.5 text-[10px] font-semibold',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={clsx(
              'grid place-items-center rounded-lg transition',
              compact ? 'h-7 w-7' : 'h-8 w-8',
              isActive
                ? 'bg-gradient-to-br from-brand-500 to-teal-600 text-white shadow-[0_8px_18px_-8px_rgba(13,148,136,0.7)]'
                : 'bg-slate-100/90 text-slate-500 group-hover:bg-white group-hover:text-brand-600 dark:bg-white/[0.06] dark:text-slate-400 dark:group-hover:text-brand-300',
            )}
          >
            <Icon name={item.icon} className={compact ? 'h-4 w-4' : 'h-4 w-4'} />
          </span>
          <span className={clsx(compact && 'leading-none')}>{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const location = useLocation();

  const current =
    FLAT_NAV.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to))) ||
    FLAT_NAV[0];

  return (
    <div className="relative min-h-screen">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand-400/10 blur-3xl dark:bg-brand-500/10" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-teal-300/10 blur-3xl dark:bg-teal-400/[0.07]" />
        <div className="surface-grid absolute inset-x-0 top-0 h-[520px] opacity-50 dark:opacity-30" />
      </div>

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-slate-200/70 bg-white/75 px-4 py-5 backdrop-blur-xl dark:border-white/[0.06] dark:bg-slate-950/65 lg:flex">
        <Link to="/" className="flex items-center gap-3 px-2">
          <BrandLogo size={42} glow />
          <span>
            <span className="block text-[17px] font-extrabold tracking-tight text-slate-900 dark:text-white">
              PT Brain
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600/80 dark:text-brand-300/80">
              Evidence-based coaching
            </span>
          </span>
        </Link>

        <nav className="mt-3 flex-1 overflow-y-auto pr-1">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="nav-section">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavItem key={item.to} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3 dark:border-white/[0.07] dark:bg-white/[0.03]">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-teal-700 text-[11px] font-extrabold text-white shadow-sm">
              {initials(user?.name) || 'PT'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {user?.name || 'Người dùng'}
              </p>
              <p className="truncate text-[11px] text-slate-400">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40"
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <Icon name="logout" className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2.5 flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Phase 6 · Hoàn thiện
            </span>
            <span className="text-slate-400">v1.0</span>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-[#f4f7f6]/80 backdrop-blur-xl dark:border-white/[0.05] dark:bg-[#070b10]/75">
          <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Link to="/" className="flex items-center gap-2 lg:hidden">
                <BrandLogo size={34} />
                <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                  PT Brain
                </span>
              </Link>
              <div className="hidden items-center gap-2 text-sm lg:flex">
                <span className="text-slate-400">PT Brain</span>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {current.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-brand-200/70 bg-brand-50/80 px-3 py-1.5 text-[11px] font-bold text-brand-700 dark:border-brand-800/60 dark:bg-brand-950/40 dark:text-brand-300 sm:inline-flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
                DeepSeek V4.1 Flash
              </span>
              <button
                type="button"
                onClick={toggle}
                className="rounded-xl border border-slate-200/80 bg-white/80 p-2 text-slate-500 transition hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white"
                title={isDark ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}
                aria-label="Đổi chế độ sáng tối"
              >
                <Icon name={isDark ? 'sun' : 'moon'} className="h-4 w-4" />
              </button>
              <Link
                to="/settings"
                className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-teal-700 text-[11px] font-extrabold text-white shadow-sm"
                title="Hồ sơ & cài đặt"
              >
                {initials(user?.name) || 'PT'}
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 lg:px-8 lg:pb-14 lg:pt-9">
          <div key={location.pathname} className="animate-fade-up">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-3 bottom-3 z-30 rounded-2xl border border-slate-200/80 bg-white/90 px-1.5 py-1.5 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {MOBILE_NAV.map((item) => (
            <NavItem key={item.to} item={item} compact />
          ))}
        </div>
      </nav>
    </div>
  );
}
