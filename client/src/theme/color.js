/**
 * Tiện ích màu cho Theme Studio.
 *
 * Toàn bộ bảng màu được sinh từ 2-3 màu gốc (accent + ink) để mỗi theme vẫn
 * giữ đủ 11 bậc 50…950 mà Tailwind đang dùng, thay vì phải viết tay hàng trăm
 * mã màu.
 */

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeHex(value) {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(HEX_RE);
  if (!match) return null;
  let hex = match[1];
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }
  return `#${hex.toLowerCase()}`;
}

export function hexToRgb(hex) {
  const value = normalizeHex(hex) || '#000000';
  return {
    r: parseInt(value.slice(1, 3), 16),
    g: parseInt(value.slice(3, 5), 16),
    b: parseInt(value.slice(5, 7), 16),
  };
}

export function rgbToHex({ r, g, b }) {
  const to = (channel) =>
    Math.round(Math.max(0, Math.min(255, channel)))
      .toString(16)
      .padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Chuỗi "r g b" để dùng với rgb(var(--token) / <alpha-value>). */
export function triplet(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `${r} ${g} ${b}`;
}

/** Trộn 2 màu; weight = 0 trả về a, weight = 1 trả về b. */
export function mixHex(a, b, weight = 0.5) {
  const from = hexToRgb(a);
  const to = hexToRgb(b);
  const w = Math.max(0, Math.min(1, weight));
  return rgbToHex({
    r: from.r + (to.r - from.r) * w,
    g: from.g + (to.g - from.g) * w,
    b: from.b + (to.b - from.b) * w,
  });
}

export function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let h = 0;

  if (delta !== 0) {
    if (max === red) h = ((green - blue) / delta) % 6;
    else if (max === green) h = (blue - red) / delta + 2;
    else h = (red - green) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h, s: s * 100, l: l * 100 };
}

export function hslToHex(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.max(0, Math.min(100, s)) / 100;
  const light = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;
  let rgb = [0, 0, 0];

  if (hue < 60) rgb = [c, x, 0];
  else if (hue < 120) rgb = [x, c, 0];
  else if (hue < 180) rgb = [0, c, x];
  else if (hue < 240) rgb = [0, x, c];
  else if (hue < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];

  return rgbToHex({
    r: (rgb[0] + m) * 255,
    g: (rgb[1] + m) * 255,
    b: (rgb[2] + m) * 255,
  });
}

/**
 * Kéo màu về phía đen/trắng cho đến khi đạt tương phản tối thiểu.
 * Dùng cho accent tùy chỉnh: giữ nguyên hue, chỉ chỉnh độ sáng.
 */
function ensureContrast(hex, against, target) {
  const towardLight = relativeLuminance(against) > 0.5;
  const direction = towardLight ? '#0b0f0d' : '#ffffff';
  let result = hex;
  for (let step = 0; step < 40 && contrastRatio(result, against) < target; step += 1) {
    result = mixHex(result, direction, 0.06);
  }
  return result;
}

/** Ramp accent 50…950, giữ nguyên màu gốc ở bậc 600. */
export function accentRamp(base, { accessible = true } = {}) {
  const color = normalizeHex(base) || '#0e6b52';
  const white = '#ffffff';
  const black = '#0b0f0d';

  // Bậc 600/700 dùng làm nền cho chữ trắng và làm chữ trên giấy sáng.
  // Bậc 300/400 dùng làm chữ/accent trên nền tối. Khi người dùng chọn màu
  // quá sáng hoặc quá tối, tự chỉnh độ sáng để vẫn đọc được.
  const shaded600 = accessible ? ensureContrast(color, '#f5f6f2', 4.5) : color;
  const shaded700 = accessible
    ? ensureContrast(mixHex(shaded600, black, 0.16), '#f5f6f2', 4.5)
    : mixHex(color, black, 0.15);
  const tinted300 = accessible
    ? ensureContrast(mixHex(color, white, 0.48), '#0e1211', 4.5)
    : mixHex(color, white, 0.48);
  const tinted400 = accessible
    ? ensureContrast(mixHex(color, white, 0.3), '#0e1211', 3)
    : mixHex(color, white, 0.3);

  return {
    50: mixHex(color, white, 0.92),
    100: mixHex(color, white, 0.84),
    200: mixHex(color, white, 0.68),
    300: tinted300,
    400: tinted400,
    500: mixHex(color, white, 0.13),
    600: shaded600,
    700: shaded700,
    800: mixHex(shaded700, black, 0.14),
    900: mixHex(shaded700, black, 0.28),
    950: mixHex(shaded700, black, 0.5),
  };
}

/**
 * Ramp ink trung tính. Màu gốc chỉ quyết định hue + saturation; độ sáng theo
 * đúng các bậc đang dùng trong app để chữ sáng/tối vẫn đạt tương phản.
 */
export function inkRamp(base) {
  const { h, s } = hexToHsl(normalizeHex(base) || '#5f6a61');
  const sat = Math.max(3, Math.min(18, s));
  return {
    50: hslToHex(h, sat * 0.55, 95),
    100: hslToHex(h, sat * 0.75, 90.5),
    200: hslToHex(h, sat * 0.85, 84),
    300: hslToHex(h, sat * 0.95, 75.5),
    400: hslToHex(h, sat, 62),
    500: hslToHex(h, sat, 40),
    600: hslToHex(h, sat, 31),
    700: hslToHex(h, sat, 26),
    800: hslToHex(h, sat, 18.5),
    900: hslToHex(h, sat, 11.5),
    950: hslToHex(h, sat, 6.5),
  };
}

/**
 * Bộ bề mặt sáng/tối cùng tông với theme. Saturation thấp để không biến nền
 * thành màu trang trí.
 */
export function makeSurfaces(hue, saturation, darkHue = hue) {
  const s = Math.max(4, Math.min(30, saturation));
  const dh = Number.isFinite(darkHue) ? darkHue : hue;
  return {
    light: {
      paper: hslToHex(hue, s * 0.5, 96.4),
      paper2: hslToHex(hue, s * 0.55, 93.2),
      surface: hslToHex(hue, s * 0.22, 99.2),
      surface2: hslToHex(hue, s * 0.4, 94),
      line: hslToHex(hue, s * 0.35, 84),
      lineStrong: hslToHex(hue, s * 0.32, 76.5),
      pageDeep: hslToHex(hue, s * 0.45, 7.5),
      surfaceDeep: hslToHex(hue, s * 0.4, 11),
    },
    dark: {
      paper: hslToHex(dh, s * 0.52, 7.5),
      paper2: hslToHex(dh, s * 0.5, 10),
      surface: hslToHex(dh, s * 0.42, 10.4),
      surface2: hslToHex(dh, s * 0.46, 13.4),
      line: hslToHex(dh, s * 0.32, 23),
      lineStrong: hslToHex(dh, s * 0.3, 31),
      pageDeep: hslToHex(dh, s * 0.5, 6.4),
      surfaceDeep: hslToHex(dh, s * 0.42, 10.4),
    },
  };
}

export function shellFor(accent) {
  const { h, s } = hexToHsl(accent);
  return hslToHex(h, Math.min(24, s * 0.7), 8.2);
}

export function alphaColor(varName, alpha = 1) {
  const safe = Math.max(0, Math.min(1, alpha));
  return safe >= 1 ? `rgb(var(${varName}))` : `rgb(var(${varName}) / ${safe})`;
}

export function colorMix(varName, weight = 10, transparent = true) {
  const pct = Math.max(0, Math.min(100, weight));
  return transparent
    ? `color-mix(in srgb, ${alphaColor(varName)} ${pct}%, transparent)`
    : `color-mix(in srgb, ${alphaColor(varName)} ${pct}%, white)`;
}

/** Độ sáng tương đối theo WCAG. */
export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const channels = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function contrastRatio(a, b) {
  const light = Math.max(relativeLuminance(a), relativeLuminance(b));
  const dark = Math.min(relativeLuminance(a), relativeLuminance(b));
  return (light + 0.05) / (dark + 0.05);
}

/** Chọn trắng hoặc mực đậm có tương phản tốt hơn trên một nền. */
export function readableOn(background) {
  return contrastRatio(background, '#fffdf7') >= contrastRatio(background, '#0b0f0d')
    ? '#fffdf7'
    : '#0b0f0d';
}
