import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useTheme } from '../hooks/useTheme.jsx';
import { Icon } from './ui.jsx';
import BrandLogo from './BrandLogo.jsx';
import { initials } from '../lib/format.js';
import { formatLongDate, todayKey } from '../lib/date.js';

const GROUPS = [
  {
    label: 'Hôm nay',
    items: [{ to: '/', label: 'Tổng quan', icon: 'dashboard', end: true }],
  },
  {
    label: 'Cơ thể',
    items: [
      { to: '/body-log', label: 'Theo dõi cơ thể', icon: 'activity' },
      { to: '/body-assessment', label: 'AI thể trạng', icon: 'camera' },
      { to: '/muscles', label: 'Cơ bắp 3D', icon: 'body' },
    ],
  },
  {
    label: 'Kế hoạch',
    items: [
      { to: '/nutrition', label: 'Dinh dưỡng', icon: 'utensils' },
      { to: '/training', label: 'Giáo án', icon: 'dumbbell', trainingTab: 'planner' },
      { to: '/training?tab=workout', label: 'Log buổi tập', icon: 'clipboard', trainingTab: 'workout' },
    ],
  },
  {
    label: 'Kiến thức',
    items: [
      { to: '/research', label: 'Nghiên cứu', icon: 'book' },
      { to: '/learn', label: 'Học tập', icon: 'notebook' },
    ],
  },
  {
    label: 'Công cụ',
    items: [{ to: '/calculators', label: 'Máy tính chỉ số', icon: 'calculator' }],
  },
];

const MOBILE_NAV = [
  { to: '/', label: 'Tổng quan', icon: 'dashboard', end: true },
  { to: '/body-log', label: 'Cơ thể', icon: 'activity' },
  { to: '/nutrition', label: 'Dinh dưỡng', icon: 'utensils' },
  { to: '/training', label: 'Giáo án', icon: 'dumbbell' },
  { to: '/research', label: 'Nghiên cứu', icon: 'book' },
];

function useActive() {
  const location = useLocation();
  const tab = new URLSearchParams(location.search).get('tab');

  return (item) => {
    if (item.trainingTab) {
      if (location.pathname !== '/training') return false;
      const current = tab || 'planner';
      if (item.trainingTab === 'planner') return current !== 'workout';
      return current === item.trainingTab;
    }
    if (item.end) return location.pathname === item.to;
    return location.pathname === item.to;
  };
}

function NavItem({ item, active, onClick, rail = false }) {
  return (
    <Link
      to={item.to}
      onClick={onClick}
      title={rail ? item.label : undefined}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'group relative flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors',
        active
          ? 'bg-white/[0.09] text-white'
          : 'text-white/60 hover:bg-white/[0.05] hover:text-white/90',
        rail && 'justify-center px-0',
      )}
    >
      <Icon
        name={item.icon}
        className={clsx('h-4 w-4 shrink-0', active ? 'text-pine-300' : 'text-white/45')}
      />
      {!rail && <span className="truncate">{item.label}</span>}
      {!rail && active && <span className="ml-auto h-1 w-1 rounded-full bg-pine-300" />}
    </Link>
  );
}

function SidebarContent({ onNavigate, rail = false }) {
  const { user, logout } = useAuth();
  const isActive = useActive();
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col">
      <div className={clsx('flex h-14 items-center gap-2.5 border-b border-white/[0.08]', rail ? 'justify-center px-0' : 'px-4')}>
        <Link to="/" onClick={onNavigate} className="flex min-w-0 items-center gap-2.5">
          <BrandLogo size={30} />
          {!rail && (
            <span className="min-w-0">
              <span className="block truncate font-display text-[16px] font-semibold leading-none text-white">
                PT Brain
              </span>
              <span className="mt-1 block truncate font-mono text-[11px] uppercase tracking-[0.14em] text-pine-300">
                Evidence-based
              </span>
            </span>
          )}
        </Link>
      </div>

      <nav
        aria-label="Điều hướng chính"
        className={clsx('flex-1 overflow-y-auto pb-4', rail ? 'px-2 pt-4' : 'px-2')}
      >
        {GROUPS.map((group) => (
          <div key={group.label}>
            {!rail && <p className="nav-section">{group.label}</p>}
            {rail && <div className="mx-2 my-3 border-t border-white/[0.07]" />}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.to}
                  item={item}
                  active={isActive(item)}
                  onClick={onNavigate}
                  rail={rail}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className={clsx('border-t border-white/[0.08] p-2', rail && 'px-1')}>
        <Link
          to="/settings"
          onClick={onNavigate}
          title="Cài đặt"
          className={clsx(
            'flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors',
            'text-white/60 hover:bg-white/[0.05] hover:text-white',
            rail && 'justify-center px-0',
          )}
        >
          <Icon name="settings" className="h-4 w-4 shrink-0 text-white/45" />
          {!rail && 'Cài đặt'}
        </Link>

        <div
          className={clsx(
            'mt-1 flex items-center gap-2.5 rounded-md px-2 py-2',
            rail && 'justify-center px-0',
          )}
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.06] font-mono text-[11px] font-medium text-white">
            {initials(user?.name) || 'PT'}
          </span>
          {!rail && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-medium text-white/90">{user?.name}</span>
                <span className="block truncate text-[11px] text-white/40">{user?.email}</span>
              </span>
              <button
                type="button"
                title="Đăng xuất"
                aria-label="Đăng xuất"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="grid h-7 w-7 place-items-center rounded text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <Icon name="logout" className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  const { isDark, toggle } = useTheme();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname, location.search]);

  const section =
    (location.pathname === '/settings' ? 'Tài khoản' : null) ||
    GROUPS.find((g) => g.items.some((i) => i.to.split('?')[0] === location.pathname))?.label ||
    'PT Brain';

  return (
    <div className="min-h-screen bg-paper dark:bg-[#0e1211]">
      {/* Desktop / tablet rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-16 border-r border-white/[0.06] bg-shell md:block lg:w-[248px]">
        <div className="hidden h-full lg:block">
          <SidebarContent />
        </div>
        <div className="h-full lg:hidden">
          <SidebarContent rail />
        </div>
      </aside>

      <div className="md:pl-16 lg:pl-[248px]">
        <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-sm dark:border-white/[0.08] dark:bg-[#0e1211]/95">
          <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-md border border-line text-slate-600 md:hidden dark:border-white/10 dark:text-slate-300"
              aria-label="Mở menu"
            >
              <Icon name="menu" className="h-4 w-4" />
            </button>

            <Link to="/" className="flex items-center gap-2 md:hidden">
              <BrandLogo size={26} />
              <span className="font-display text-[15px] font-semibold text-slate-900 dark:text-white">
                PT Brain
              </span>
            </Link>

            <div className="hidden min-w-0 items-center gap-2 md:flex">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                {section}
              </span>
              <Icon name="chevronRight" className="h-3 w-3 text-slate-300 dark:text-slate-600" />
              <span className="truncate text-[12.5px] font-medium text-slate-600 dark:text-slate-300">
                {formatLongDate(todayKey())}
              </span>
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggle}
                className="grid h-9 w-9 place-items-center rounded-md border border-line text-slate-500 transition-colors hover:bg-paper-2 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                title={isDark ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}
                aria-label="Đổi chế độ sáng tối"
              >
                <Icon name={isDark ? 'sun' : 'moon'} className="h-4 w-4" />
              </button>
              <Link
                to="/settings"
                className="hidden items-center gap-2 rounded-md border border-line py-1 pl-1 pr-2.5 transition-colors hover:border-line-strong sm:flex dark:border-white/10 dark:hover:border-white/20"
                title="Hồ sơ & cài đặt"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-pine-700 font-mono text-[11px] font-medium text-white dark:bg-pine-500 dark:text-pine-950">
                  <UserInitials />
                </span>
                <Icon name="chevronDown" className="h-3 w-3 text-slate-500 dark:text-slate-400" />
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1320px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-14 lg:pt-8">
          <div key={location.pathname}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Điều hướng nhanh"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden dark:border-white/[0.08] dark:bg-[#151b18]/95"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {MOBILE_NAV.map((item) => {
            const active = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={clsx(
                  'flex flex-col items-center gap-1 py-2 text-[11px] font-medium',
                  active ? 'text-pine-700 dark:text-pine-300' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500',
                )}
              >
                <Icon name={item.icon} className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
            aria-label="Đóng menu"
          />
          <div className="absolute inset-y-0 left-0 w-[280px] bg-shell shadow-overlay">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="absolute right-2 top-3 z-10 grid h-8 w-8 place-items-center rounded text-white/60 hover:bg-white/[0.08] hover:text-white"
              aria-label="Đóng menu"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function UserInitials() {
  const { user } = useAuth();
  return <>{initials(user?.name) || 'PT'}</>;
}
