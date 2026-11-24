import { alphaColor } from './color.js';

const rgb = (token) => `rgb(var(${token}))`;
const a = (token, alpha) => `rgb(var(${token}) / ${alpha})`;
const calc = (px) => `calc(${px}px * var(--ts-radius, 1))`;
const WHITE = 'rgb(255 253 247)';

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

function buttonVars(value, mode) {
  const dark = mode === 'dark';
  const base = {
    '--ts-btn-radius': calc(6),
    '--ts-btn-border-width': '1px',
    '--ts-btn-bg-image': 'none',
    '--ts-btn-transform': 'none',
  };

  switch (value) {
    case 'soft':
      return {
        ...base,
        '--ts-btn-bg': dark ? a('--ts-accent-900', 0.55) : rgb('--ts-accent-100'),
        '--ts-btn-fg': dark ? rgb('--ts-accent-200') : rgb('--ts-accent-800'),
        '--ts-btn-border': dark ? a('--ts-accent-700', 0.5) : rgb('--ts-accent-200'),
        '--ts-btn-hover-bg': dark ? a('--ts-accent-800', 0.6) : rgb('--ts-accent-200'),
        '--ts-btn-hover-border': dark ? a('--ts-accent-600', 0.7) : rgb('--ts-accent-300'),
        '--ts-btn-shadow': 'none',
        '--ts-btn-hover-shadow': 'none',
      };
    case 'outline':
      return {
        ...base,
        '--ts-btn-bg': 'transparent',
        '--ts-btn-bg-image': 'none',
        '--ts-btn-fg': dark ? rgb('--ts-accent-300') : rgb('--ts-accent-700'),
        '--ts-btn-border': dark ? a('--ts-accent-400', 0.65) : a('--ts-accent-600', 0.55),
        '--ts-btn-hover-bg': dark ? a('--ts-accent-950', 0.55) : a('--ts-accent-50', 0.9),
        '--ts-btn-hover-border': dark ? rgb('--ts-accent-300') : rgb('--ts-accent-700'),
        '--ts-btn-shadow': 'none',
        '--ts-btn-hover-shadow': 'none',
      };
    case 'gradient':
      return {
        ...base,
        '--ts-btn-bg': rgb('--ts-accent-600'),
        '--ts-btn-bg-image': `linear-gradient(135deg, ${rgb('--ts-accent-500')} 0%, ${rgb(
          '--ts-accent-700',
        )} 55%, ${rgb('--ts-accent-800')} 100%)`,
        '--ts-btn-fg': 'var(--ts-on-accent-600)',
        '--ts-btn-border': 'transparent',
        '--ts-btn-hover-bg': rgb('--ts-accent-600'),
        '--ts-btn-hover-border': 'transparent',
        '--ts-btn-shadow': `0 10px 22px -14px ${a('--ts-accent-800', 0.7)}, inset 0 1px 0 ${a(
          '--ts-accent-300',
          0.28,
        )}`,
        '--ts-btn-hover-shadow': `0 14px 26px -14px ${a('--ts-accent-800', 0.8)}, inset 0 1px 0 ${a(
          '--ts-accent-300',
          0.32,
        )}`,
      };
    case 'brutal':
      return {
        ...base,
        '--ts-btn-radius': calc(2),
        '--ts-btn-border-width': '1.5px',
        '--ts-btn-bg': rgb('--ts-accent-600'),
        '--ts-btn-fg': 'var(--ts-on-accent-600)',
        '--ts-btn-border': dark ? rgb('--ts-ink-100') : rgb('--ts-ink-900'),
        '--ts-btn-hover-bg': rgb('--ts-accent-700'),
        '--ts-btn-hover-border': dark ? WHITE : rgb('--ts-ink-950'),
        '--ts-btn-shadow': `3px 3px 0 ${dark ? WHITE : rgb('--ts-ink-900')}`,
        '--ts-btn-hover-shadow': `1px 1px 0 ${dark ? WHITE : rgb('--ts-ink-900')}`,
        '--ts-btn-transform': 'translate(2px, 2px)',
      };
    case 'neon':
      return {
        ...base,
        '--ts-btn-bg': 'transparent',
        '--ts-btn-fg': dark ? rgb('--ts-accent-300') : rgb('--ts-accent-700'),
        '--ts-btn-border': dark ? a('--ts-accent-400', 0.7) : a('--ts-accent-500', 0.5),
        '--ts-btn-hover-bg': dark ? a('--ts-accent-950', 0.55) : a('--ts-accent-50', 0.8),
        '--ts-btn-hover-border': dark ? rgb('--ts-accent-300') : rgb('--ts-accent-600'),
        '--ts-btn-shadow': `0 0 0 1px ${a('--ts-accent-500', 0.08)}, 0 0 18px -2px ${a(
          '--ts-accent-500',
          dark ? 0.4 : 0.25,
        )}`,
        '--ts-btn-hover-shadow': `0 0 0 1px ${a('--ts-accent-500', 0.12)}, 0 0 26px -2px ${a(
          '--ts-accent-500',
          dark ? 0.55 : 0.35,
        )}`,
      };
    default:
      return {
        ...base,
        '--ts-btn-bg': dark ? rgb('--ts-accent-400') : rgb('--ts-accent-700'),
        '--ts-btn-fg': dark ? 'var(--ts-on-accent-400)' : 'var(--ts-on-accent-700)',
        '--ts-btn-border': 'transparent',
        '--ts-btn-hover-bg': dark ? rgb('--ts-accent-300') : rgb('--ts-accent-800'),
        '--ts-btn-hover-border': 'transparent',
        '--ts-btn-shadow': dark
          ? 'none'
          : `0 1px 2px ${a('--ts-accent-950', 0.3)}, inset 0 1px 0 rgba(255,255,255,0.16)`,
        '--ts-btn-hover-shadow': dark
          ? 'none'
          : `0 1px 2px ${a('--ts-accent-950', 0.35)}, inset 0 1px 0 rgba(255,255,255,0.18)`,
      };
  }
}

/* ------------------------------------------------------------------ */
/* Cards                                                               */
/* ------------------------------------------------------------------ */

function cardVars(value, mode) {
  const dark = mode === 'dark';
  const base = {
    '--ts-card-radius': calc(8),
    '--ts-card-border-width': '1px',
    '--ts-card-top-width': '1px',
    '--ts-card-blur': 'none',
    '--ts-card-overlay': 'none',
    '--ts-card-bg': rgb('--ts-surface'),
    '--ts-card-border': dark ? 'rgba(255,255,255,0.08)' : rgb('--ts-line'),
    '--ts-card-top-color': 'var(--ts-card-border)',
    '--ts-card-header-bg': dark ? 'rgba(255,255,255,0.015)' : a('--ts-paper-2', 0.35),
    '--ts-card-shadow': dark
      ? '0 1px 2px rgba(0,0,0,0.35), 0 14px 32px -18px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)'
      : '0 1px 2px rgba(16,24,20,0.045), 0 10px 28px -18px rgba(16,24,20,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
  };

  switch (value) {
    case 'flat':
      return {
        ...base,
        '--ts-card-shadow': 'none',
        '--ts-card-header-bg': 'transparent',
      };
    case 'outline':
      return {
        ...base,
        '--ts-card-border': dark ? a('--ts-accent-500', 0.45) : a('--ts-accent-600', 0.4),
        '--ts-card-header-bg': dark ? a('--ts-accent-950', 0.35) : a('--ts-accent-50', 0.7),
        '--ts-card-shadow': 'none',
      };
    case 'glass':
      return {
        ...base,
        '--ts-card-bg': dark ? a('--ts-surface', 0.68) : a('--ts-surface', 0.72),
        '--ts-card-border': dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.8)',
        '--ts-card-header-bg': dark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.35)',
        '--ts-card-blur': 'blur(16px) saturate(1.25)',
        '--ts-card-overlay': `linear-gradient(135deg, rgba(255,255,255,${
          dark ? '0.06' : '0.5'
        }) 0%, transparent 42%)`,
        '--ts-card-shadow': dark
          ? '0 24px 48px -26px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)'
          : '0 24px 48px -30px rgba(16,24,20,0.25), inset 0 1px 0 rgba(255,255,255,0.9)',
      };
    case 'editorial':
      return {
        ...base,
        '--ts-card-radius': calc(2),
        '--ts-card-top-width': '3px',
        '--ts-card-top-color': dark ? rgb('--ts-accent-400') : rgb('--ts-accent-600'),
        '--ts-card-shadow': 'none',
        '--ts-card-header-bg': 'transparent',
        '--ts-card-border': 'transparent',
      };
    case 'brutal':
      return {
        ...base,
        '--ts-card-radius': calc(2),
        '--ts-card-border-width': '1.5px',
        '--ts-card-border': dark ? rgb('--ts-ink-100') : rgb('--ts-ink-900'),
        '--ts-card-top-width': '1.5px',
        '--ts-card-header-bg': dark ? a('--ts-surface-2', 0.8) : a('--ts-paper-2', 0.8),
        '--ts-card-shadow': `4px 4px 0 ${dark ? WHITE : rgb('--ts-ink-900')}`,
      };
    default:
      return base;
  }
}

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */

function inputVars(value, mode) {
  const dark = mode === 'dark';
  const base = {
    '--ts-input-radius': calc(6),
    '--ts-input-border-width': '1px',
    '--ts-input-bg': rgb('--ts-surface'),
    '--ts-input-fg': dark ? rgb('--ts-ink-50') : rgb('--ts-ink-900'),
    '--ts-input-border': dark ? 'rgba(255,255,255,0.12)' : rgb('--ts-line'),
    '--ts-input-shadow': dark ? 'none' : 'inset 0 1px 2px rgba(16,24,20,0.03)',
    '--ts-input-font': 'inherit',
    '--ts-input-placeholder': dark ? rgb('--ts-ink-400') : rgb('--ts-ink-500'),
    '--ts-input-focus-border': dark ? rgb('--ts-accent-400') : rgb('--ts-accent-600'),
  };

  switch (value) {
    case 'filled':
      return {
        ...base,
        '--ts-input-bg': dark ? a('--ts-surface-2', 0.9) : rgb('--ts-paper-2'),
        '--ts-input-border': 'transparent',
        '--ts-input-shadow': 'none',
      };
    case 'underline':
      return {
        ...base,
        '--ts-input-radius': '0px',
        '--ts-input-border-width': '0 0 1px',
        '--ts-input-bg': 'transparent',
        '--ts-input-shadow': 'none',
      };
    case 'boxed':
      return {
        ...base,
        '--ts-input-radius': calc(2),
        '--ts-input-border-width': '1.5px',
        '--ts-input-border': dark ? rgb('--ts-ink-100') : rgb('--ts-ink-900'),
        '--ts-input-shadow': 'none',
      };
    case 'terminal':
      return {
        ...base,
        '--ts-input-radius': calc(2),
        '--ts-input-bg': rgb('--ts-ink-950'),
        '--ts-input-fg': rgb('--ts-accent-300'),
        '--ts-input-border': a('--ts-accent-700', 0.6),
        '--ts-input-placeholder': a('--ts-accent-400', 0.55),
        '--ts-input-font': 'var(--ts-font-mono)',
        '--ts-input-shadow': `inset 0 1px 0 ${a('--ts-accent-400', 0.06)}`,
      };
    default:
      return base;
  }
}

/* ------------------------------------------------------------------ */
/* Tabs                                                                */
/* ------------------------------------------------------------------ */

function tabVars(value, mode) {
  const dark = mode === 'dark';
  const base = {
    '--ts-tabbar-bg': 'transparent',
    '--ts-tabbar-border': dark ? 'rgba(255,255,255,0.08)' : rgb('--ts-line'),
    '--ts-tabbar-border-width': '0 0 1px',
    '--ts-tabbar-padding': '0',
    '--ts-tabbar-gap': '4px',
    '--ts-tabbar-radius': '0px',
    '--ts-tabbar-width': 'auto',
    '--ts-tab-bg': 'transparent',
    '--ts-tab-fg': dark ? rgb('--ts-ink-400') : rgb('--ts-ink-500'),
    '--ts-tab-hover-fg': dark ? WHITE : rgb('--ts-ink-900'),
    '--ts-tab-border': 'transparent',
    '--ts-tab-border-width': '0 0 2px',
    '--ts-tab-radius': '0px',
    '--ts-tab-height': '40px',
    '--ts-tab-margin': '0 0 -1px',
    '--ts-tab-pad': '12px',
    '--ts-tab-active-bg': 'transparent',
    '--ts-tab-active-fg': dark ? WHITE : rgb('--ts-ink-900'),
    '--ts-tab-active-border': dark ? rgb('--ts-accent-400') : rgb('--ts-accent-700'),
    '--ts-tab-active-shadow': 'none',
  };

  switch (value) {
    case 'segmented':
      return {
        ...base,
        '--ts-tabbar-bg': dark ? a('--ts-surface-2', 0.6) : rgb('--ts-paper-2'),
        '--ts-tabbar-border': 'transparent',
        '--ts-tabbar-border-width': '0',
        '--ts-tabbar-padding': '4px',
        '--ts-tabbar-gap': '2px',
        '--ts-tabbar-radius': calc(9),
        '--ts-tabbar-width': 'fit-content',
        '--ts-tab-border-width': '0',
        '--ts-tab-radius': calc(6),
        '--ts-tab-height': '32px',
        '--ts-tab-margin': '0',
        '--ts-tab-active-bg': rgb('--ts-surface'),
        '--ts-tab-active-fg': dark ? WHITE : rgb('--ts-ink-900'),
        '--ts-tab-active-border': 'transparent',
        '--ts-tab-active-shadow': dark
          ? '0 1px 2px rgba(0,0,0,0.4)'
          : '0 1px 2px rgba(16,24,20,0.08)',
      };
    case 'boxed':
      return {
        ...base,
        '--ts-tabbar-border-width': '0',
        '--ts-tabbar-gap': '6px',
        '--ts-tabbar-width': 'fit-content',
        '--ts-tab-border': dark ? 'rgba(255,255,255,0.12)' : rgb('--ts-line'),
        '--ts-tab-border-width': '1px',
        '--ts-tab-radius': calc(6),
        '--ts-tab-height': '34px',
        '--ts-tab-margin': '0',
        '--ts-tab-active-bg': dark ? rgb('--ts-accent-400') : rgb('--ts-accent-600'),
        '--ts-tab-active-fg': dark ? 'var(--ts-on-accent-400)' : 'var(--ts-on-accent-600)',
        '--ts-tab-active-border': dark ? rgb('--ts-accent-400') : rgb('--ts-accent-600'),
      };
    case 'pill':
      return {
        ...base,
        '--ts-tabbar-border-width': '0',
        '--ts-tabbar-gap': '6px',
        '--ts-tabbar-width': 'fit-content',
        '--ts-tab-border': dark ? 'rgba(255,255,255,0.12)' : rgb('--ts-line'),
        '--ts-tab-border-width': '1px',
        '--ts-tab-radius': '9999px',
        '--ts-tab-height': '32px',
        '--ts-tab-margin': '0',
        '--ts-tab-active-bg': dark ? a('--ts-accent-950', 0.65) : a('--ts-accent-50', 0.9),
        '--ts-tab-active-fg': dark ? rgb('--ts-accent-200') : rgb('--ts-accent-800'),
        '--ts-tab-active-border': dark ? a('--ts-accent-500', 0.75) : rgb('--ts-accent-600'),
      };
    case 'bare':
      return {
        ...base,
        '--ts-tabbar-border-width': '0',
        '--ts-tabbar-gap': '2px',
        '--ts-tabbar-width': 'fit-content',
        '--ts-tab-border-width': '0',
        '--ts-tab-radius': calc(4),
        '--ts-tab-height': '32px',
        '--ts-tab-margin': '0',
        '--ts-tab-active-bg': dark ? a('--ts-surface', 0.65) : a('--ts-paper-2', 0.7),
        '--ts-tab-active-fg': dark ? rgb('--ts-accent-200') : rgb('--ts-accent-800'),
        '--ts-tab-active-border': 'transparent',
      };
    default:
      return base;
  }
}

/* ------------------------------------------------------------------ */
/* Badges                                                              */
/* ------------------------------------------------------------------ */

function badgeToneVars(value, mode) {
  const dark = mode === 'dark';
  const tag = {
    neutral: {
      bg: dark ? 'rgba(255,255,255,0.06)' : rgb('--ts-paper-2'),
      fg: dark ? rgb('--ts-ink-300') : rgb('--ts-ink-600'),
      border: dark ? 'rgba(255,255,255,0.1)' : rgb('--ts-line'),
    },
    pine: {
      bg: dark ? a('--ts-accent-950', 0.5) : rgb('--ts-accent-50'),
      fg: dark ? rgb('--ts-accent-300') : rgb('--ts-accent-700'),
      border: dark ? a('--ts-accent-700', 0.5) : rgb('--ts-accent-200'),
    },
    alert: {
      bg: dark ? a('--ts-danger-950', 0.4) : rgb('--ts-danger-50'),
      fg: dark ? rgb('--ts-danger-300') : rgb('--ts-danger-700'),
      border: dark ? a('--ts-danger-800', 0.6) : rgb('--ts-danger-200'),
    },
    warn: {
      bg: dark ? a('--ts-warn-900', 0.3) : rgb('--ts-warn-50'),
      fg: dark ? rgb('--ts-warn-300') : rgb('--ts-warn-700'),
      border: dark ? a('--ts-warn-800', 0.6) : rgb('--ts-warn-200'),
    },
  };

  let tones = tag;
  let shape = {
    '--ts-badge-radius': calc(3),
    '--ts-badge-padding': '2px 6px',
    '--ts-badge-transform': 'uppercase',
    '--ts-badge-weight': '500',
    '--ts-badge-dot': 'none',
  };

  if (value === 'pill') {
    shape = {
      ...shape,
      '--ts-badge-radius': '9999px',
      '--ts-badge-padding': '3px 9px',
    };
  } else if (value === 'solid') {
    const solid = {
      neutral: {
        bg: dark ? rgb('--ts-ink-200') : rgb('--ts-ink-700'),
        fg: dark ? rgb('--ts-ink-950') : WHITE,
        border: 'transparent',
      },
      pine: {
        bg: dark ? rgb('--ts-accent-400') : rgb('--ts-accent-700'),
        fg: dark ? 'var(--ts-on-accent-400)' : 'var(--ts-on-accent-700)',
        border: 'transparent',
      },
      alert: {
        bg: dark ? rgb('--ts-danger-400') : rgb('--ts-danger-700'),
        fg: dark ? rgb('--ts-ink-950') : WHITE,
        border: 'transparent',
      },
      warn: {
        bg: dark ? rgb('--ts-warn-400') : rgb('--ts-warn-700'),
        fg: dark ? rgb('--ts-ink-950') : WHITE,
        border: 'transparent',
      },
    };
    tones = solid;
  } else if (value === 'outline') {
    tones = {
      neutral: {
        bg: 'transparent',
        fg: dark ? rgb('--ts-ink-300') : rgb('--ts-ink-600'),
        border: dark ? 'rgba(255,255,255,0.2)' : rgb('--ts-line-strong'),
      },
      pine: {
        bg: 'transparent',
        fg: dark ? rgb('--ts-accent-300') : rgb('--ts-accent-700'),
        border: dark ? a('--ts-accent-500', 0.6) : a('--ts-accent-600', 0.5),
      },
      alert: {
        bg: 'transparent',
        fg: dark ? rgb('--ts-danger-300') : rgb('--ts-danger-700'),
        border: dark ? a('--ts-danger-500', 0.6) : a('--ts-danger-600', 0.5),
      },
      warn: {
        bg: 'transparent',
        fg: dark ? rgb('--ts-warn-300') : rgb('--ts-warn-700'),
        border: dark ? a('--ts-warn-500', 0.6) : a('--ts-warn-600', 0.5),
      },
    };
  } else if (value === 'dot') {
    shape = { ...shape, '--ts-badge-dot': 'inline-block' };
  }

  const vars = { ...shape };
  for (const [tone, colors] of Object.entries(tones)) {
    vars[`--ts-badge-${tone}-bg`] = colors.bg;
    vars[`--ts-badge-${tone}-fg`] = colors.fg;
    vars[`--ts-badge-${tone}-border`] = colors.border;
  }
  return vars;
}

/* ------------------------------------------------------------------ */
/* Metrics                                                             */
/* ------------------------------------------------------------------ */

function metricVars(value, mode) {
  const dark = mode === 'dark';
  const base = {
    '--ts-metric-strip-bg': 'transparent',
    '--ts-metric-strip-border': dark ? 'rgba(255,255,255,0.08)' : rgb('--ts-line'),
    '--ts-metric-strip-border-width': '1px 0',
    '--ts-metric-strip-radius': '0px',
    '--ts-metric-strip-padding': '0',
    '--ts-metric-gap': '0',
    '--ts-metric-bg': 'transparent',
    '--ts-metric-border': 'transparent',
    '--ts-metric-border-width': '0',
    '--ts-metric-radius': '0px',
    '--ts-metric-padding': 'clamp(16px, 2vw, 20px)',
  };

  switch (value) {
    case 'cards':
      return {
        ...base,
        '--ts-metric-strip-border-width': '0',
        '--ts-metric-gap': '12px',
        '--ts-metric-bg': rgb('--ts-surface'),
        '--ts-metric-border': dark ? 'rgba(255,255,255,0.08)' : rgb('--ts-line'),
        '--ts-metric-border-width': '1px',
        '--ts-metric-radius': calc(8),
        '--ts-metric-padding': '16px',
      };
    case 'plate':
      return {
        ...base,
        '--ts-metric-strip-border-width': '0',
        '--ts-metric-gap': '8px',
        '--ts-metric-bg': dark ? a('--ts-surface-2', 0.72) : a('--ts-paper-2', 0.7),
        '--ts-metric-border': dark ? 'rgba(255,255,255,0.06)' : a('--ts-line', 0.65),
        '--ts-metric-border-width': '1px',
        '--ts-metric-radius': calc(4),
        '--ts-metric-padding': '14px',
      };
    case 'accent':
      return {
        ...base,
        '--ts-metric-strip-border-width': '0',
        '--ts-metric-gap': '0',
        '--ts-metric-border': dark ? rgb('--ts-accent-400') : rgb('--ts-accent-600'),
        '--ts-metric-border-width': '2px 0 0',
        '--ts-metric-padding': '14px 16px',
      };
    default:
      return base;
  }
}

/* ------------------------------------------------------------------ */
/* Tables                                                              */
/* ------------------------------------------------------------------ */

function tableVars(value, mode) {
  const dark = mode === 'dark';
  const base = {
    '--ts-table-head-border': dark ? 'rgba(255,255,255,0.08)' : rgb('--ts-line'),
    '--ts-table-row-border': dark ? 'rgba(255,255,255,0.06)' : a('--ts-line', 0.7),
    '--ts-table-row-style': 'solid',
    '--ts-table-even-bg': 'transparent',
    '--ts-table-head-bg': 'transparent',
    '--ts-table-frame': '0 solid transparent',
    '--ts-table-radius': '0px',
    '--ts-table-pad': '10px 12px',
    '--ts-table-collapse': 'separate',
    '--ts-table-body-font': 'inherit',
  };

  switch (value) {
    case 'zebra':
      return {
        ...base,
        '--ts-table-even-bg': dark ? 'rgba(255,255,255,0.03)' : a('--ts-paper-2', 0.55),
      };
    case 'boxed':
      return {
        ...base,
        '--ts-table-frame': `1px solid ${dark ? 'rgba(255,255,255,0.1)' : rgb('--ts-line')}`,
        '--ts-table-radius': calc(8),
        '--ts-table-head-bg': dark ? 'rgba(255,255,255,0.04)' : a('--ts-paper-2', 0.55),
        '--ts-table-collapse': 'separate',
        '--ts-table-pad': '10px 12px',
      };
    case 'ledger':
      return {
        ...base,
        '--ts-table-row-style': 'dashed',
        '--ts-table-head-border': dark ? 'rgba(255,255,255,0.18)' : rgb('--ts-ink-800'),
        '--ts-table-body-font': 'var(--ts-font-mono)',
      };
    case 'airy':
      return {
        ...base,
        '--ts-table-row-border': dark ? 'rgba(255,255,255,0.05)' : a('--ts-line', 0.45),
        '--ts-table-pad': '16px 16px 16px 0',
      };
    default:
      return base;
  }
}

/* ------------------------------------------------------------------ */
/* Shell / header / page header                                        */
/* ------------------------------------------------------------------ */

function shellVars(value) {
  switch (value) {
    case 'ink':
      return {
        '--ts-shell-bg': 'linear-gradient(180deg, #171c1a 0%, #0a0d0c 100%)',
        '--ts-shell-border': 'rgba(255,255,255,0.08)',
      };
    case 'accent':
      return {
        '--ts-shell-bg': `linear-gradient(180deg, ${rgb('--ts-accent-900')} 0%, ${rgb(
          '--ts-accent-950',
        )} 100%)`,
        '--ts-shell-border': a('--ts-accent-400', 0.18),
      };
    case 'gradient':
      return {
        '--ts-shell-bg': `linear-gradient(165deg, ${rgb('--ts-accent-800')} 0%, ${rgb(
          '--ts-accent-950',
        )} 38%, ${rgb('--ts-shell')} 100%)`,
        '--ts-shell-border': a('--ts-accent-400', 0.16),
      };
    default:
      return {
        '--ts-shell-bg': `linear-gradient(180deg, ${rgb('--ts-shell-2')} 0%, ${rgb(
          '--ts-shell',
        )} 48%, ${rgb('--ts-shell-3')} 100%)`,
        '--ts-shell-border': 'rgba(255,255,255,0.08)',
      };
  }
}

function headerVars(value, mode) {
  const dark = mode === 'dark';
  switch (value) {
    case 'solid':
      return {
        '--ts-header-bg': rgb('--ts-surface'),
        '--ts-header-blur': 'none',
        '--ts-header-border': rgb('--ts-line'),
        '--ts-header-border-width': '1px',
      };
    case 'hairline':
      return {
        '--ts-header-bg': a('--ts-paper', 0.72),
        '--ts-header-blur': 'none',
        '--ts-header-border': a('--ts-line', 0.9),
        '--ts-header-border-width': '1px',
      };
    case 'accent':
      return {
        '--ts-header-bg': a('--ts-paper', 0.92),
        '--ts-header-blur': 'blur(12px)',
        '--ts-header-border': dark ? rgb('--ts-accent-400') : rgb('--ts-accent-600'),
        '--ts-header-border-width': '2px',
      };
    default:
      return {
        '--ts-header-bg': a('--ts-paper', 0.9),
        '--ts-header-blur': 'blur(12px) saturate(1.1)',
        '--ts-header-border': a('--ts-line', 1),
        '--ts-header-border-width': '1px',
      };
  }
}

function pageHeadVars(value, mode) {
  const dark = mode === 'dark';
  const base = {
    '--ts-pagehead-bg': 'transparent',
    '--ts-pagehead-border': rgb('--ts-line'),
    '--ts-pagehead-border-width': '0 0 1px',
    '--ts-pagehead-padding': '0 0 16px',
    '--ts-pagehead-radius': '0px',
    '--ts-pagehead-justify': 'space-between',
    '--ts-pagehead-align': 'flex-end',
    '--ts-pagehead-direction': 'row',
    '--ts-pagehead-text-align': 'left',
    '--ts-page-title-font': 'var(--ts-font-display)',
    '--ts-page-title-transform': 'none',
    '--ts-page-title-size': 'clamp(30px, 2.6vw, 34px)',
    '--ts-page-title-tracking': '-0.022em',
    '--ts-page-sub-margin': '0',
  };

  switch (value) {
    case 'banner':
      return {
        ...base,
        '--ts-pagehead-bg': dark ? a('--ts-accent-950', 0.7) : a('--ts-accent-50', 0.8),
        '--ts-pagehead-border': dark ? a('--ts-accent-700', 0.55) : rgb('--ts-accent-200'),
        '--ts-pagehead-border-width': '1px',
        '--ts-pagehead-padding': '18px 20px',
        '--ts-pagehead-radius': calc(8),
        '--ts-page-title-size': 'clamp(28px, 2.4vw, 32px)',
      };
    case 'mono':
      return {
        ...base,
        '--ts-page-title-font': 'var(--ts-font-mono)',
        '--ts-page-title-transform': 'uppercase',
        '--ts-page-title-size': '26px',
        '--ts-page-title-tracking': '0.015em',
      };
    case 'center':
      return {
        ...base,
        '--ts-pagehead-justify': 'center',
        '--ts-pagehead-align': 'center',
        '--ts-pagehead-direction': 'column',
        '--ts-pagehead-text-align': 'center',
        '--ts-page-title-size': 'clamp(28px, 2.4vw, 32px)',
        '--ts-page-sub-margin': '0 auto',
      };
    default:
      return base;
  }
}

/* ------------------------------------------------------------------ */
/* Effects                                                             */
/* ------------------------------------------------------------------ */

export const MOTION = {
  off: { dur: '0ms', pageDuration: '0.01ms', rise: '0px', ease: 'linear' },
  calm: { dur: '100ms', pageDuration: '180ms', rise: '0px', ease: 'ease-out' },
  subtle: { dur: '160ms', pageDuration: '240ms', rise: '6px', ease: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  lively: { dur: '240ms', pageDuration: '420ms', rise: '12px', ease: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  cinematic: {
    dur: '320ms',
    pageDuration: '720ms',
    rise: '18px',
    ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
};

const HOVER = {
  none: {
    transform: 'none',
    border: 'var(--ts-card-border)',
    shadow: 'var(--ts-card-shadow)',
    overlay: 'var(--ts-card-overlay, none)',
    spot: '0',
  },
  border: {
    transform: 'none',
    border: 'color-mix(in srgb, var(--ts-card-border) 55%, rgb(var(--ts-ink-400)))',
    shadow: 'var(--ts-card-shadow)',
    overlay: 'var(--ts-card-overlay, none)',
    spot: '0',
  },
  lift: {
    transform: 'translateY(-3px)',
    border: 'var(--ts-line-strong)',
    shadow: '0 18px 38px -26px rgba(0, 0, 0, 0.45)',
    overlay: 'var(--ts-card-overlay, none)',
    spot: '0',
  },
  glow: {
    transform: 'none',
    border: a('--ts-accent-500', 0.55),
    shadow: `0 0 0 1px ${a('--ts-accent-500', 0.16)}, 0 18px 44px -24px ${a(
      '--ts-accent-600',
      0.5,
    )}`,
    overlay: 'var(--ts-card-overlay, none)',
    spot: '0',
  },
  accent: {
    transform: 'none',
    border: 'var(--ts-accent-live)',
    shadow: 'var(--ts-card-shadow)',
    overlay: 'var(--ts-card-overlay, none)',
    spot: '0',
  },
  spotlight: {
    transform: 'none',
    border: a('--ts-accent-500', 0.4),
    shadow: 'var(--ts-card-shadow)',
    overlay: `radial-gradient(260px circle at var(--ts-mx, 50%) var(--ts-my, 50%), ${a(
      '--ts-accent-400',
      0.16,
    )}, transparent 65%)`,
    spot: '1',
  },
};

export function effectVars(effects) {
  const motion = MOTION[effects.motion] || MOTION.subtle;
  const hover = HOVER[effects.hover] || HOVER.border;
  return {
    '--ts-dur': motion.dur,
    '--ts-page-duration': motion.pageDuration,
    '--ts-page-rise': motion.rise,
    '--ts-ease': motion.ease,
    '--ts-hover-transform': hover.transform,
    '--ts-hover-border': hover.border,
    '--ts-hover-shadow': hover.shadow,
    '--ts-hover-overlay': hover.overlay,
    '--ts-spot-opacity': hover.spot,
  };
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export function componentVarsFor(group, value, mode) {
  switch (group) {
    case 'button':
      return buttonVars(value, mode);
    case 'card':
      return cardVars(value, mode);
    case 'input':
      return inputVars(value, mode);
    case 'tabs':
      return tabVars(value, mode);
    case 'badge':
      return badgeToneVars(value, mode);
    case 'metric':
      return metricVars(value, mode);
    case 'table':
      return tableVars(value, mode);
    case 'shell':
      return shellVars(value);
    case 'header':
      return headerVars(value, mode);
    case 'pageHead':
      return pageHeadVars(value, mode);
    default:
      return {};
  }
}

export function componentVars(components, mode) {
  const vars = {};
  for (const [group, value] of Object.entries(components)) {
    Object.assign(vars, componentVarsFor(group, value, mode));
  }
  return vars;
}

export { alphaColor };
