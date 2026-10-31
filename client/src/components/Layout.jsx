import { NavLink, Link } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useTheme } from '../hooks/useTheme.jsx';
import { Icon } from './ui.jsx';
import { initials } from '../lib/format.js';

const NAV = [
  { to: '/', label: 'Tổng quan', icon: 'dashboard', end: true },
  { to: '/body-log', label: 'Theo dõi cơ thể', icon: 'activity' },
  { to: '/calculators', label: 'Máy tính', icon: 'calculator' },
  { to: '/settings', label: 'Cài đặt', icon: 'settings' },
];

function NavItem({ item, compact = false }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
          isActive
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100',
          compact && 'flex-col gap-1 rounded-lg px-2 py-1.5 text-[11px]',
        )
      }
    >
      <Icon name={item.icon} className={compact ? 'h-5 w-5' : 'h-5 w-5'} />
      <span>{item.label}</span>
    </NavLink>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white/90 px-4 py-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-3 px-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-lg font-black text-white shadow-soft">
            PT
          </span>
          <span>
            <span className="block text-base font-bold tracking-tight text-slate-900 dark:text-white">
              PT Brain
            </span>
            <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Research · Metrics · Plan
            </span>
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </nav>

        <div className="mt-4 rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-200">
              {initials(user?.name) || 'PT'}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {user?.name || 'Người dùng'}
              </p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Icon name="logout" className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-slate-100/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-8">
            <Link to="/" className="flex items-center gap-2 lg:hidden">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-sm font-black text-white">
                PT
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">PT Brain</span>
            </Link>
            <div className="hidden items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 lg:flex">
              <span className="inline-flex h-2 w-2 rounded-full bg-brand-500" />
              Giai đoạn 1 · Nền tảng &amp; theo dõi cơ thể
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggle}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white"
                title={isDark ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}
                aria-label="Đổi chế độ sáng tối"
              >
                <Icon name={isDark ? 'sun' : 'moon'} className="h-4 w-4" />
              </button>
              <Link
                to="/settings"
                className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-200"
                title="Hồ sơ"
              >
                {initials(user?.name) || 'PT'}
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 lg:px-8 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.4rem)] pt-1.5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {NAV.map((item) => (
            <NavItem key={item.to} item={item} compact />
          ))}
        </div>
      </nav>
    </div>
  );
}
