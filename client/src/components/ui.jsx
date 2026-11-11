import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

const ICONS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  calculator: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="8" x2="8" y1="11" y2="11.01" />
      <line x1="12" x2="12" y1="11" y2="11.01" />
      <line x1="16" x2="16" y1="11" y2="11.01" />
      <line x1="8" x2="8" y1="15" y2="15.01" />
      <line x1="12" x2="12" y1="15" y2="15.01" />
      <line x1="16" x2="16" y1="15" y2="15.01" />
      <line x1="8" x2="16" y1="19" y2="19" />
    </>
  ),
  settings: (
    <>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </>
  ),
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  plus: <path d="M5 12h14M12 5v14" />,
  minus: <path d="M5 12h14" />,
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </>
  ),
  upload: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </>
  ),
  arrowRight: <path d="M5 12h14M12 5l7 7-7 7" />,
  arrowUpRight: (
    <>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  alert: (
    <>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  scale: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <path d="M8 8h8M8 12h2M14 12h2M8 16h2M14 16h2" />
    </>
  ),
  flame: (
    <path d="M12 2s4 4.5 4 8a4 4 0 0 1-8 0c0-1 .3-2 .8-2.8C8 9 6 11 6 14a6 6 0 0 0 12 0c0-5-6-9-6-12Z" />
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  send: (
    <>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
    </>
  ),
  close: <path d="M18 6 6 18M6 6l12 12" />,
  external: (
    <>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </>
  ),
  dumbbell: (
    <>
      <path d="m6.5 6.5 11 11" />
      <path d="m21 21-1-1" />
      <path d="m3 3 1 1" />
      <path d="m18 22 4-4" />
      <path d="m2 6 4-4" />
      <path d="m3 10 7-7" />
      <path d="m14 21 7-7" />
    </>
  ),
  cards: (
    <>
      <rect x="3" y="5" width="13" height="16" rx="2" />
      <path d="M7 3h11a2 2 0 0 1 2 2v13" />
    </>
  ),
  notebook: (
    <>
      <path d="M4 4a2 2 0 0 1 2-2h13v20H6a2 2 0 0 1-2-2V4Z" />
      <path d="M8 2v20" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  filter: <path d="M22 3H2l8 9.5V19l4 2v-8.5Z" />,
  bolt: <path d="M13 2 3 14h8l-1 8 10-12h-8Z" />,
  utensils: (
    <>
      <path d="M3 2v7a3 3 0 0 0 6 0V2M6 2v20" />
      <path d="M17 2c-2 2-3 5-3 8h3v12" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="18" rx="2" />
      <path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h4" />
    </>
  ),
  drop: <path d="M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />,
  ruler: (
    <>
      <rect x="2" y="8" width="20" height="8" rx="1" transform="rotate(-45 12 12)" />
      <path d="m7 13 2 2M10 10l2 2M13 7l2 2" />
    </>
  ),
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  refresh: (
    <>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </>
  ),
  play: <path d="m6 3 14 9-14 9Z" />,
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 6 10 7 10-7" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  camera: (
    <>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z" />
      <circle cx="12" cy="13" r="3.2" />
    </>
  ),
  body: (
    <>
      <circle cx="12" cy="4" r="2" />
      <path d="M12 7v6" />
      <path d="m12 13-3 8" />
      <path d="m12 13 3 8" />
      <path d="m6 10 6-2 6 2" />
    </>
  ),
};

export function Icon({ name, className = 'h-4 w-4', strokeWidth = 1.7 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICONS[name] ?? null}
    </svg>
  );
}

export function Card({ className, children, ...props }) {
  return (
    <div className={clsx('panel p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function Panel({ title, note, actions, children, className, bodyClassName, flush }) {
  return (
    <section className={clsx('panel', className)}>
      {(title || actions) && (
        <header className="panel-header">
          <div className="min-w-0">
            {title && <h2 className="panel-title">{title}</h2>}
            {note && <p className="panel-note">{note}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={clsx(!flush && 'panel-body', bodyClassName)}>{children}</div>
    </section>
  );
}

export function PageHeader({ title, subtitle, actions, meta }) {
  return (
    <div className="page-head">
      <div className="min-w-0">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
        {meta && <div className="page-meta">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const STAT_TONES = {
  default: 'text-slate-900 dark:text-slate-50',
  brand: 'text-pine-700 dark:text-pine-300',
  danger: 'text-vermilion-600 dark:text-vermilion-300',
  warning: 'text-ochre-600 dark:text-ochre-300',
};

export function Stat({ label, value, unit, hint, tone = 'default', icon, info }) {
  return (
    <div className="metric">
      <div className="flex items-start justify-between gap-2">
        <p className="metric-label">
          {label}
          {info && <InfoTip label={label}>{info}</InfoTip>}
        </p>
        {icon && <Icon name={icon} className="mt-0.5 h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />}
      </div>
      <p className={clsx('metric-value', STAT_TONES[tone])}>
        {value}
        {unit && <span className="metric-unit">{unit}</span>}
      </p>
      {hint && <p className="metric-note">{hint}</p>}
    </div>
  );
}

/**
 * Chú thích ngắn cho một chỉ số: bấm/hover vào biểu tượng ⓘ để đọc định nghĩa.
 */
export function InfoTip({ label, children, className }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);

  const show = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const width = 248;
      const left = Math.max(
        8,
        Math.min(window.innerWidth - width - 8, rect.left + rect.width / 2 - width / 2),
      );
      const placeBelow = rect.top < 120;
      setPosition({
        left,
        top: placeBelow ? rect.bottom + 8 : rect.top - 8,
        below: placeBelow,
      });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <span className={clsx('inline-flex align-middle', className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Giải thích chỉ số ${label}`}
        aria-expanded={open}
        className="grid h-[16px] w-[16px] place-items-center rounded-full text-slate-500 dark:text-slate-400 transition-colors hover:text-pine-700 dark:text-slate-500 dark:hover:text-pine-300"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (open) setOpen(false);
          else show();
        }}
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        onFocus={show}
        onBlur={() => setOpen(false)}
      >
        <Icon name="info" className="h-3 w-3" />
      </button>
      {open &&
        position &&
        createPortal(
          <span
            role="tooltip"
            style={{
              left: position.left,
              top: position.top,
              transform: position.below ? 'none' : 'translateY(-100%)',
            }}
            className="pointer-events-none fixed z-[80] w-[248px] rounded-md border border-line bg-surface p-3 text-left text-[12px] font-normal normal-case leading-relaxed tracking-normal text-slate-600 shadow-overlay dark:border-white/10 dark:bg-[#1b2320] dark:text-slate-300"
          >
            <span className="block font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
              {label}
            </span>
            <span className="mt-1 block">{children}</span>
          </span>,
          document.body,
        )}
    </span>
  );
}

export function Field({ label, hint, error, children, className }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{hint}</p>}
      {error && (
        <p className="mt-1 text-[11px] font-medium leading-relaxed text-vermilion-600 dark:text-vermilion-300">
          {error}
        </p>
      )}
    </div>
  );
}

const ALERT_TONES = {
  info: 'border-pine-200 bg-pine-50 text-pine-900 dark:border-pine-800/50 dark:bg-pine-950/40 dark:text-pine-200',
  warning:
    'border-ochre-200 bg-ochre-50 text-ochre-900 dark:border-ochre-800/50 dark:bg-ochre-900/25 dark:text-ochre-200',
  danger:
    'border-vermilion-200 bg-vermilion-50 text-vermilion-900 dark:border-vermilion-800/50 dark:bg-vermilion-900/25 dark:text-vermilion-200',
  success:
    'border-pine-200 bg-pine-50 text-pine-800 dark:border-pine-800/50 dark:bg-pine-950/40 dark:text-pine-200',
};

export function Alert({ tone = 'info', title, children, className }) {
  const icon =
    tone === 'danger' || tone === 'warning' ? 'alert' : tone === 'success' ? 'check' : 'info';
  return (
    <div
      className={clsx(
        'flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-[12.5px] leading-relaxed',
        ALERT_TONES[tone],
        className,
      )}
    >
      <Icon name={icon} className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={clsx(title && 'mt-0.5')}>{children}</div>
      </div>
    </div>
  );
}

export function Segmented({ options, value, onChange, className }) {
  return (
    <div className={clsx('tabbar -mt-1 mb-5', className)} role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx('tab', value === opt.value && 'tab-active')}
        >
          {opt.icon && <Icon name={opt.icon} className="h-3.5 w-3.5" />}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function Badge({ tone = 'neutral', children, className }) {
  return (
    <span className={clsx('badge', `badge-${tone}`, className)}>{children}</span>
  );
}

export function EmptyState({ icon = 'info', title, note, action, className }) {
  return (
    <div className={clsx('empty', className)}>
      <span className="grid h-8 w-8 place-items-center rounded-md border border-line bg-paper-2 text-slate-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-400">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <p className="empty-title">{title}</p>
      {note && <p className="empty-note">{note}</p>}
      {action && <div className="mt-1 flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}

export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <svg className={clsx('animate-spin text-pine-700 dark:text-pine-300', className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
    </svg>
  );
}

export function LoadingBlock({ label = 'Đang tải dữ liệu…' }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-16 text-[12px] text-slate-500 dark:text-slate-400">
      <Spinner className="h-4 w-4" />
      {label}
    </div>
  );
}

/** Render modal ra document.body để không bị cắt bởi stacking context của Layout. */
export function Portal({ children }) {
  return createPortal(children, document.body);
}
