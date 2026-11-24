import { mixHex, readableOn, triplet } from './color.js';
import {
  getAccentScale,
  getDangerScale,
  getInkScale,
  getShape,
  getTheme,
  getTypePair,
  getWarnScale,
} from './presets.js';
import { componentVars, componentVarsFor, effectVars } from './variants.js';

function scaleVars(prefix, scale) {
  const vars = {};
  for (const [step, hex] of Object.entries(scale)) {
    vars[`--ts-${prefix}-${step}`] = triplet(hex);
  }
  return vars;
}

/**
 * Các biến nền tảng dùng chung cho cả app, preview và từng ô variant.
 * mode: 'light' | 'dark'
 */
export function buildBaseVars(config, mode = 'light') {
  const theme = getTheme(config.themeId);
  const surfaces = theme.surfaces[mode === 'dark' ? 'dark' : 'light'];
  const type = getTypePair(config.typeId);
  const shape = getShape(config.shapeId);
  const shell = theme.shell;
  const accent = getAccentScale(theme, config.accentOverride);

  return {
    ...scaleVars('ink', getInkScale(theme)),
    ...scaleVars('accent', accent),
    ...scaleVars('danger', getDangerScale(theme)),
    ...scaleVars('warn', getWarnScale(theme)),
    '--ts-on-accent-400': readableOn(accent[400]),
    '--ts-on-accent-500': readableOn(accent[500]),
    '--ts-on-accent-600': readableOn(accent[600]),
    '--ts-on-accent-700': readableOn(accent[700]),
    '--ts-paper': triplet(surfaces.paper),
    '--ts-paper-2': triplet(surfaces.paper2),
    '--ts-surface': triplet(surfaces.surface),
    '--ts-surface-2': triplet(surfaces.surface2),
    '--ts-line': triplet(surfaces.line),
    '--ts-line-strong': triplet(surfaces.lineStrong),
    '--ts-page-deep': triplet(surfaces.pageDeep),
    '--ts-surface-deep': triplet(surfaces.surfaceDeep),
    '--ts-shell': triplet(shell),
    '--ts-shell-2': triplet(mixHex(shell, '#ffffff', 0.07)),
    '--ts-shell-3': triplet(mixHex(shell, '#000000', 0.32)),
    '--ts-shell-ink': triplet('#e8e5db'),
    '--ts-accent-live': `rgb(var(--ts-accent-${mode === 'dark' ? '400' : '600'}))`,
    '--ts-font-display': type.display,
    '--ts-font-sans': type.sans,
    '--ts-font-mono': type.mono,
    '--ts-radius': String(shape.radius),
    ...effectVars(config.effects),
  };
}

/** Toàn bộ biến của một cấu hình, gồm cả component. */
export function buildStudioVars(config, mode = 'light') {
  return {
    ...buildBaseVars(config, mode),
    ...componentVars(config.components, mode),
  };
}

/** Biến nền + đúng một nhóm component, dùng cho ô xem trước variant. */
export function buildVariantVars(config, group, value, mode = 'light') {
  return {
    ...buildBaseVars(config, mode),
    ...componentVarsFor(group, value, mode),
  };
}

export const buildThemeVars = buildStudioVars;
