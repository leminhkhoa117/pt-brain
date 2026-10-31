import { useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useTheme } from '../hooks/useTheme.jsx';
import { Icon } from './ui.jsx';
import BrandLogo from './BrandLogo.jsx';
import { initials } from '../lib/format.js';

const PRIMARY = [
  { to: '/', label: 'Tổng quan', icon: 'dashboard', end: true },
  { to: '/body-log', label: 'Cơ thể', icon: 'activity' },
  { to: '/nutrition', label: 'Dinh dưỡng', icon: 'flame' },
  { to: '/research', label: 'Nghiên cứu', icon: 'book' },
  { to: '/training', label: 'Giáo án', icon: 'dumbbell' },
  { to: '/learn', label: 'Học tập', icon: 'notebook' },
];

const MORE = [
  { to: '/clients', label: 'Khách hàng', icon: 'users' },
  { to: '/calculators', label: 'Máy tính chỉ số', icon: 'calculator' },
  { to: '/settings', label: 'Cài đặt', icon: 'settings' },
];

const BODY_LINKS = [
  { to: '/body-log', label: 'Theo dõi cơ thể', icon: 'activity' },
  { to: '/body-assessment', label: 'AI thể trạng', icon: 'target' },
];

const ALL_NAV = [...PRIMARY, BODY_LINKS[1], ...MORE];
const MOBILE_PATHS = ['/', '/body-log', '/nutrition', '/research', '/training'];
const MOBILE_NAV = PRIMARY.filter((item) => MOBILE_PATHS.includes(item.to));

function HeaderLink({ item, onClick }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition',
          isActive
            ? 'bg-brand-600 text-white shadow-[0_8px_20px_-10px_rgba(13,148,136,0.9)] dark:bg-brand-500'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white',
        )
      }
    >
      <Icon name={item.icon} className="h-4 w-4" />
      {item.label}
    </NavLink>
  );
}

function MobileNavItem({ item }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        clsx(
          'flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-semibold transition',
          isActive
            ? 'text-brand-700 dark:text-brand-300'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={clsx(
              'grid h-8 w-8 place-items-center rounded-lg transition',
              isActive
                ? 'bg-gradient-to-br from-brand-500 to-teal-600 text-white shadow'
                : 'bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400',
            )}
          >
            <Icon name={item.icon} className="h-4 w-4" />
          </span>
          {item.label}
        </>
      )}
    </NavLink>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const logoutAndClose = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand-400/10 blur-3xl dark:bg-brand-500/10" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-teal-300/10 blur-3xl dark:bg-teal-400/[0.07]" />
        <div className="surface-grid absolute inset-x-0 top-0 h-[420px] opacity-50 dark:opacity-30" />
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-[#f4f7f6]/85 backdrop-blur-xl dark:border-white/[0.05] dark:bg-[#070b10]/80">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-3 px-4 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2.5" onClick={() => setMenuOpen(false)}>
            <BrandLogo size={38} glow />
            <span className="hidden sm:block">
              <span className="block text-[16px] font-extrabold leading-none tracking-tight text-slate-900 dark:text-white">
                PT Brain
              </span>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-brand-600/80 dark:text-brand-300/80">
                Evidence-based coaching
              </span>
            </span>
          </Link>

          <nav className="ml-2 hidden flex-1 items-center gap-0.5 lg:flex">
            {PRIMARY.map((item) => (
              <HeaderLink key={item.to} item={item} />
            ))}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className={clsx(
                  'inline-flex items-center gap-1 rounded-xl px-2.5 py-2 text-[13px] font-semibold transition',
                  moreOpen
                    ? 'bg-slate-100 text-slate-900 dark:bg-white/[0.06] dark:text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white',
                )}
              >
                Thêm
                <Icon name="chevronDown" className="h-3.5 w-3.5" />
              </button>
              {moreOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-30 cursor-default"
                    aria-label="Đóng menu"
                    onClick={() => setMoreOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-40 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-slate-900">
                    {MORE.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMoreOpen(false)}
                        className={({ isActive }) =>
                          clsx(
                            'flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold',
                            isActive
                              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.06]',
                          )
                        }
                      >
                        <Icon name={item.icon} className="h-4 w-4" />
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </>
              )}
            </div>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-brand-200/70 bg-brand-50/80 px-3 py-1.5 text-[10px] font-bold text-brand-700 dark:border-brand-800/60 dark:bg-brand-950/40 dark:text-brand-300 xl:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
              DeepSeek V4.1 · Vision Gemini
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
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="rounded-xl border border-slate-200/80 bg-white/80 p-2 text-slate-500 lg:hidden dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400"
              aria-label="Mở menu"
            >
              <Icon name="menu" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 lg:px-8 lg:pb-14 lg:pt-8">
        <div key={location.pathname} className="animate-fade-up">
          {children}
        </div>
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-30 rounded-2xl border border-slate-200/80 bg-white/[0.92] px-1.5 py-1.5 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/[0.92] lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {MOBILE_NAV.map((item) => (
            <MobileNavItem key={item.to} item={item} />
          ))}
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-label="Đóng menu"
          />
          <div className="absolute inset-y-0 right-0 w-[290px] overflow-auto bg-white p-4 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrandLogo size={34} />
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">PT Brain</span>
              </div>
              <button type="button" className="btn-ghost !p-2" onClick={() => setMenuOpen(false)}>
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-1">
              {ALL_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold',
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.06]',
                    )
                  }
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 p-3 dark:border-white/10">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {user?.name}
              </p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
              <button
                type="button"
                onClick={logoutAndClose}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                <Icon name="logout" className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
