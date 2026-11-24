import {
  accentRamp,
  inkRamp,
  makeSurfaces,
  normalizeHex,
  shellFor,
} from './color.js';

/* ------------------------------------------------------------------ */
/* Bảng màu gốc — giữ đúng token hiện tại của PT Brain                 */
/* ------------------------------------------------------------------ */

export const PROTOCOL_ACCENT = {
  50: '#eaf3ee',
  100: '#d3e7dc',
  200: '#a9cfbe',
  300: '#77b29b',
  400: '#5fbf9e',
  500: '#2e8a6b',
  600: '#0e6b52',
  700: '#0b5642',
  800: '#0a4535',
  900: '#09382c',
  950: '#052019',
};

export const PROTOCOL_INK = {
  50: '#f1f3ee',
  100: '#e7eae3',
  200: '#d8ddd4',
  300: '#c3c9bf',
  400: '#9aa39b',
  500: '#5f6a61',
  600: '#4a554c',
  700: '#3d4741',
  800: '#29332d',
  900: '#1a211d',
  950: '#0d1210',
};

export const PROTOCOL_DANGER = {
  50: '#f9ece8',
  100: '#f2d8d1',
  200: '#e5b3a6',
  300: '#d68d7a',
  400: '#c96a53',
  500: '#b8432c',
  600: '#9e3723',
  700: '#7f2c1c',
  800: '#612117',
  900: '#451812',
  950: '#2b0f0b',
};

export const PROTOCOL_WARN = {
  50: '#f8f1df',
  100: '#f0e3c3',
  200: '#e3cb92',
  300: '#d3b063',
  400: '#c19234',
  500: '#a9761b',
  600: '#8d6116',
  700: '#714d13',
  800: '#573b10',
  900: '#3e2a0c',
  950: '#261a07',
};

const PROTOCOL_SURFACES = {
  light: {
    paper: '#f5f6f2',
    paper2: '#edefe9',
    surface: '#fefffc',
    surface2: '#eef0ea',
    line: '#d8ddd4',
    lineStrong: '#c3c9bf',
    pageDeep: '#0e1211',
    surfaceDeep: '#151b18',
  },
  dark: {
    paper: '#0e1211',
    paper2: '#111614',
    surface: '#151b18',
    surface2: '#1b2320',
    line: '#2a302d',
    lineStrong: '#3a423e',
    pageDeep: '#0b0f0d',
    surfaceDeep: '#151b18',
  },
};

/* ------------------------------------------------------------------ */
/* Themes                                                              */
/* ------------------------------------------------------------------ */

function makeTheme({ id, name, note, family, accent, ink, hue, sat, darkHue, danger, warn }) {
  return {
    id,
    name,
    note,
    family,
    accent,
    ink,
    danger: danger || '#b8432c',
    warn: warn || '#a9761b',
    shell: shellFor(accent),
    surfaces: makeSurfaces(hue, sat, darkHue),
  };
}

export const THEMES = [
  {
    id: 'protocol',
    name: 'Protocol Sheet',
    note: 'Bản gốc: giấy lâm sàng, mực than, một sắc pine.',
    family: 'core',
    accent: '#0e6b52',
    ink: '#1a211d',
    danger: '#b8432c',
    warn: '#a9761b',
    shell: '#0e1713',
    surfaces: PROTOCOL_SURFACES,
    exact: true,
  },
  makeTheme({
    id: 'clinic',
    name: 'Clinic Blue',
    note: 'Xanh lâm sàng trên giấy lạnh, sạch và điềm.',
    family: 'cool',
    accent: '#2f5d8a',
    ink: '#5b6672',
    hue: 210,
    sat: 18,
  }),
  makeTheme({
    id: 'ocean',
    name: 'Ocean Lab',
    note: 'Teal biển sâu, nền sáng hơi ngả xanh.',
    family: 'cool',
    accent: '#0b7285',
    ink: '#566a6e',
    hue: 192,
    sat: 18,
  }),
  makeTheme({
    id: 'sage',
    name: 'Sage Studio',
    note: 'Xô thơm dịu, gần với màu giấy thủ công.',
    family: 'calm',
    accent: '#5f7f4f',
    ink: '#606a5b',
    hue: 105,
    sat: 10,
  }),
  makeTheme({
    id: 'clay',
    name: 'Clay Court',
    note: 'Đất nung ấm, cảm giác sổ tay tại sân tập.',
    family: 'warm',
    accent: '#b2512f',
    ink: '#6a5c53',
    hue: 25,
    sat: 18,
  }),
  makeTheme({
    id: 'ember',
    name: 'Ember Forge',
    note: 'Cam than hồng, mạnh nhưng vẫn có mực.',
    family: 'warm',
    accent: '#b8541c',
    ink: '#6a5b52',
    hue: 22,
    sat: 20,
  }),
  makeTheme({
    id: 'plum',
    name: 'Plum Thesis',
    note: 'Mận học thuật, tiết chế và hơi bí ẩn.',
    family: 'bold',
    accent: '#7a3f8f',
    ink: '#645b70',
    hue: 292,
    sat: 12,
  }),
  makeTheme({
    id: 'rose',
    name: 'Rose Paper',
    note: 'Hồng giấy in, nền ấm và mềm mắt.',
    family: 'warm',
    accent: '#b23a5f',
    ink: '#6a5a60',
    hue: 345,
    sat: 16,
  }),
  makeTheme({
    id: 'citrus',
    name: 'Citrus Press',
    note: 'Vàng chanh đậm, dùng cho buổi sáng.',
    family: 'warm',
    accent: '#a9760b',
    ink: '#6a6250',
    hue: 45,
    sat: 22,
  }),
  makeTheme({
    id: 'graphite',
    name: 'Graphite Ledger',
    note: 'Không màu, chỉ mực và than chì.',
    family: 'core',
    accent: '#46514d',
    ink: '#5d615f',
    hue: 160,
    sat: 4,
  }),
  makeTheme({
    id: 'nordic',
    name: 'Nordic Frost',
    note: 'Băng Bắc Âu, xám xanh và sáng rõ.',
    family: 'cool',
    accent: '#3b6f92',
    ink: '#5a6774',
    hue: 204,
    sat: 12,
  }),
  makeTheme({
    id: 'sakura',
    name: 'Sakura Note',
    note: 'Anh đào trên giấy trắng, nhẹ và thơ.',
    family: 'warm',
    accent: '#c2437a',
    ink: '#6c5f66',
    hue: 338,
    sat: 14,
  }),
  makeTheme({
    id: 'cobalt',
    name: 'Cobalt Deep',
    note: 'Cobalt đậm, tương phản mạnh với giấy.',
    family: 'bold',
    accent: '#2a4fd0',
    ink: '#545f75',
    hue: 226,
    sat: 16,
  }),
  makeTheme({
    id: 'moss',
    name: 'Moss Field',
    note: 'Rêu đồng, xanh rừng trầm và khô.',
    family: 'calm',
    accent: '#4e6b2f',
    ink: '#59614f',
    hue: 92,
    sat: 10,
  }),
  makeTheme({
    id: 'coffee',
    name: 'Coffee House',
    note: 'Cà phê sữa, giấy kraft và mực nâu.',
    family: 'warm',
    accent: '#7a5230',
    ink: '#665c50',
    hue: 30,
    sat: 12,
  }),
  makeTheme({
    id: 'neon',
    name: 'Neon Terminal',
    note: 'Magenta neon, dành cho chế độ tối.',
    family: 'bold',
    accent: '#d61f8a',
    ink: '#626b78',
    hue: 286,
    sat: 10,
    darkHue: 290,
  }),
  makeTheme({
    id: 'lavender',
    name: 'Lavender Lab',
    note: 'Oải hương, mềm và có nhịp thở.',
    family: 'calm',
    accent: '#7251b5',
    ink: '#645f74',
    hue: 266,
    sat: 14,
  }),
  makeTheme({
    id: 'crimson',
    name: 'Crimson Ledger',
    note: 'Đỏ son, dứt khoát như một dấu triện.',
    family: 'bold',
    accent: '#b32636',
    ink: '#655a5a',
    hue: 355,
    sat: 14,
  }),
  makeTheme({
    id: 'desert',
    name: 'Desert Sun',
    note: 'Nắng sa mạc, hổ phách và cát.',
    family: 'warm',
    accent: '#b06a12',
    ink: '#6a5f4e',
    hue: 34,
    sat: 20,
  }),
  makeTheme({
    id: 'midnight',
    name: 'Midnight Ink',
    note: 'Mực đêm xanh, lạnh và sâu.',
    family: 'cool',
    accent: '#4356a8',
    ink: '#59627a',
    hue: 230,
    sat: 14,
    darkHue: 232,
  }),
];

export const THEME_FAMILIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'core', label: 'Gốc' },
  { id: 'calm', label: 'Dịu' },
  { id: 'warm', label: 'Ấm' },
  { id: 'cool', label: 'Lạnh' },
  { id: 'bold', label: 'Rực' },
];

/* ------------------------------------------------------------------ */
/* Typography & shape                                                  */
/* ------------------------------------------------------------------ */

export const TYPE_PAIRS = [
  {
    id: 'journal',
    name: 'Journal',
    note: 'Serif học thuật + UI Việt + mono số liệu.',
    display: '"Source Serif 4", Georgia, Cambria, serif',
    sans: '"Be Vietnam Pro", Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    sample: 'PT',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    note: 'Playfair Display + DM Sans + IBM Plex Mono.',
    display: '"Playfair Display", Georgia, Cambria, serif',
    sans: '"DM Sans", "Be Vietnam Pro", system-ui, sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    sample: 'Aa',
  },
  {
    id: 'modern',
    name: 'Modern Serif',
    note: 'Fraunces mềm + Manrope + Roboto Mono.',
    display: '"Fraunces", Georgia, Cambria, serif',
    sans: '"Manrope", "Be Vietnam Pro", system-ui, sans-serif',
    mono: '"Roboto Mono", ui-monospace, monospace',
    sample: 'Aa',
  },
  {
    id: 'technical',
    name: 'Technical',
    note: 'Space Grotesk + DM Sans + IBM Plex Mono.',
    display: '"Space Grotesk", "DM Sans", system-ui, sans-serif',
    sans: '"DM Sans", "Be Vietnam Pro", system-ui, sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
    sample: '01',
  },
  {
    id: 'grotesk',
    name: 'Grotesk',
    note: 'Một mặt chữ hình học cho cả tiêu đề và UI.',
    display: '"Space Grotesk", "DM Sans", system-ui, sans-serif',
    sans: '"Space Grotesk", "DM Sans", system-ui, sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
    sample: 'Gg',
  },
];

export const SHAPES = [
  {
    id: 'sharp',
    name: 'Sắc cạnh',
    note: 'Gần như vuông, hợp bảng dữ liệu.',
    radius: 0.45,
  },
  {
    id: 'drafted',
    name: 'Drafted',
    note: 'Bo góc 4–8px như bản gốc.',
    radius: 1,
  },
  {
    id: 'soft',
    name: 'Mềm',
    note: 'Bo tròn rõ hơn, vẫn đủ nghiêm.',
    radius: 1.75,
  },
  {
    id: 'round',
    name: 'Bo tròn',
    note: 'Card và nút mềm, gần với mobile app.',
    radius: 2.6,
  },
];

/* ------------------------------------------------------------------ */
/* Effects                                                             */
/* ------------------------------------------------------------------ */

export const EFFECT_GROUPS = [
  {
    key: 'motion',
    label: 'Chuyển động',
    note: 'Tốc độ transition, nhịp vào trang và độ nhấc.',
    options: [
      { value: 'off', label: 'Tắt', note: 'Không animation · 0ms.' },
      { value: 'calm', label: 'Điềm', note: 'Vào trang 180ms · hover 100ms · nhấc 0px.' },
      { value: 'subtle', label: 'Vừa', note: 'Vào trang 240ms · hover 160ms · nhấc 6px.' },
      { value: 'lively', label: 'Sống', note: 'Vào trang 420ms · hover 240ms · nhấc 12px.' },
      { value: 'cinematic', label: 'Điện ảnh', note: 'Vào trang 720ms · hover 320ms · nhấc 18px.' },
    ],
  },
  {
    key: 'bg',
    label: 'Nền trang',
    note: 'Lớp nền phía sau nội dung, không chặn thao tác.',
    options: [
      { value: 'radial', label: 'Quầng sáng', note: 'Một quầng accent từ trên.' },
      { value: 'plain', label: 'Phẳng', note: 'Chỉ màu giấy.' },
      { value: 'mesh', label: 'Mesh màu', note: 'Ba quầng màu loang.' },
      { value: 'grid', label: 'Lưới', note: 'Lưới kỹ thuật 32px.' },
      { value: 'dots', label: 'Chấm', note: 'Lưới chấm nhỏ.' },
      { value: 'blueprint', label: 'Bản vẽ', note: 'Lưới lớn + lưới mịn.' },
      { value: 'aurora', label: 'Cực quang', note: 'Hai quầng màu trôi chậm.' },
      { value: 'beam', label: 'Chùm sáng', note: 'Một dải sáng chéo.' },
      { value: 'rings', label: 'Vòng', note: 'Vòng đồng tâm từ góc.' },
    ],
  },
  {
    key: 'texture',
    label: 'Bề mặt',
    note: 'Lớp phủ rất nhẹ trên toàn giao diện.',
    options: [
      { value: 'none', label: 'Sạch', note: 'Không phủ.' },
      { value: 'grain', label: 'Hạt phim', note: 'Noise mịn.' },
      { value: 'scanlines', label: 'Scanline', note: 'Sọc ngang mảnh.' },
      { value: 'speckle', label: 'Đốm mực', note: 'Chấm li ti.' },
      { value: 'vignette', label: 'Viền tối', note: 'Tối bốn góc.' },
      { value: 'halftone', label: 'Halftone', note: 'Lưới chấm in ấn.' },
    ],
  },
  {
    key: 'cursor',
    label: 'Con trỏ',
    note: 'Hiệu ứng đi theo chuột, chỉ để định vị.',
    options: [
      { value: 'none', label: 'Mặc định', note: 'Không thêm gì.' },
      { value: 'glow', label: 'Quầng', note: 'Quầng accent mềm.' },
      { value: 'dot', label: 'Chấm', note: 'Chấm accent nhỏ.' },
      { value: 'ring', label: 'Vòng', note: 'Vòng tròn rỗng.' },
      { value: 'cross', label: 'Chữ thập', note: 'Tâm ngắm mảnh.' },
    ],
  },
  {
    key: 'hover',
    label: 'Hover panel',
    note: 'Phản hồi khi rê chuột lên card.',
    options: [
      { value: 'none', label: 'Không', note: 'Giữ nguyên.' },
      { value: 'border', label: 'Viền', note: 'Viền đậm hơn.' },
      { value: 'lift', label: 'Nâng', note: 'Nhấc nhẹ + bóng.' },
      { value: 'glow', label: 'Phát sáng', note: 'Quầng accent.' },
      { value: 'accent', label: 'Nhấn', note: 'Viền accent.' },
      { value: 'spotlight', label: 'Đèn chuột', note: 'Đốm sáng theo con trỏ.' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Components                                                          */
/* ------------------------------------------------------------------ */

export const COMPONENT_GROUPS = [
  {
    key: 'button',
    label: 'Nút chính',
    note: 'Nút primary. Nút phụ và nút nguy hiểm giữ đúng vai trò.',
    options: [
      { value: 'solid', label: 'Solid', note: 'Đặc, tương phản.' },
      { value: 'soft', label: 'Soft', note: 'Nền tint, chữ accent.' },
      { value: 'outline', label: 'Outline', note: 'Viền, nền trong.' },
      { value: 'gradient', label: 'Gradient', note: 'Chuyển sắc accent.' },
      { value: 'brutal', label: 'Brutal', note: 'Viền mực + bóng lệch.' },
      { value: 'neon', label: 'Neon', note: 'Viền phát sáng.' },
    ],
  },
  {
    key: 'card',
    label: 'Panel / Card',
    note: 'Bề mặt chính chứa nội dung.',
    options: [
      { value: 'sheet', label: 'Sheet', note: 'Giấy nổi, mặc định.' },
      { value: 'flat', label: 'Flat', note: 'Phẳng, không bóng.' },
      { value: 'outline', label: 'Outline', note: 'Viền accent mảnh.' },
      { value: 'glass', label: 'Glass', note: 'Trong mờ + blur.' },
      { value: 'editorial', label: 'Editorial', note: 'Rule accent trên đầu.' },
      { value: 'brutal', label: 'Brutal', note: 'Viền dày + bóng lệch.' },
    ],
  },
  {
    key: 'input',
    label: 'Ô nhập',
    note: 'Input, select và textarea.',
    options: [
      { value: 'line', label: 'Line', note: 'Viền hairline, mặc định.' },
      { value: 'filled', label: 'Filled', note: 'Nền giấy đậm.' },
      { value: 'underline', label: 'Underline', note: 'Chỉ gạch chân.' },
      { value: 'boxed', label: 'Boxed', note: 'Viền mực 1.5px.' },
      { value: 'terminal', label: 'Terminal', note: 'Nền mực, chữ mono.' },
    ],
  },
  {
    key: 'tabs',
    label: 'Tabs',
    note: 'Thanh tab và trạng thái đang chọn.',
    options: [
      { value: 'underline', label: 'Underline', note: 'Gạch chân, mặc định.' },
      { value: 'segmented', label: 'Segmented', note: 'Track nền + tab nổi.' },
      { value: 'boxed', label: 'Boxed', note: 'Tab có viền.' },
      { value: 'pill', label: 'Pill', note: 'Tab bo tròn hoàn toàn.' },
      { value: 'bare', label: 'Bare', note: 'Chỉ chữ, không viền.' },
    ],
  },
  {
    key: 'badge',
    label: 'Badge',
    note: 'Nhãn trạng thái và metadata.',
    options: [
      { value: 'tag', label: 'Tag', note: 'Mono, góc vát, mặc định.' },
      { value: 'pill', label: 'Pill', note: 'Bo tròn hoàn toàn.' },
      { value: 'solid', label: 'Solid', note: 'Nền đặc theo tone.' },
      { value: 'outline', label: 'Outline', note: 'Chỉ viền + chữ.' },
      { value: 'dot', label: 'Dot', note: 'Có chấm trạng thái.' },
    ],
  },
  {
    key: 'metric',
    label: 'Chỉ số',
    note: 'Dải measurement strip và các ô số.',
    options: [
      { value: 'strip', label: 'Strip', note: 'Dải liền, mặc định.' },
      { value: 'cards', label: 'Cards', note: 'Mỗi số một card.' },
      { value: 'plate', label: 'Plate', note: 'Nền giấy, viền mảnh.' },
      { value: 'accent', label: 'Accent', note: 'Rule accent trên mỗi ô.' },
    ],
  },
  {
    key: 'table',
    label: 'Bảng',
    note: 'Bảng dữ liệu lâm sàng.',
    options: [
      { value: 'ruled', label: 'Ruled', note: 'Hairline từng hàng.' },
      { value: 'zebra', label: 'Zebra', note: 'Hàng chẵn có nền.' },
      { value: 'boxed', label: 'Boxed', note: 'Khung + header nền.' },
      { value: 'ledger', label: 'Ledger', note: 'Nét đứt kiểu sổ cái.' },
      { value: 'airy', label: 'Airy', note: 'Thoáng hơn, viền nhạt.' },
    ],
  },
  {
    key: 'shell',
    label: 'Sidebar',
    note: 'Thanh điều hướng cố định bên trái.',
    options: [
      { value: 'pine', label: 'Theme', note: 'Theo màu shell của theme.' },
      { value: 'ink', label: 'Ink', note: 'Đen trung tính.' },
      { value: 'accent', label: 'Accent', note: 'Accent đậm.' },
      { value: 'gradient', label: 'Gradient', note: 'Accent chuyển vào shell.' },
    ],
  },
  {
    key: 'header',
    label: 'Top bar',
    note: 'Thanh header dính trên cùng.',
    options: [
      { value: 'glass', label: 'Glass', note: 'Bán trong + blur, mặc định.' },
      { value: 'solid', label: 'Solid', note: 'Nền surface đặc.' },
      { value: 'hairline', label: 'Hairline', note: 'Trong suốt, chỉ rule.' },
      { value: 'accent', label: 'Accent', note: 'Rule accent 2px.' },
    ],
  },
  {
    key: 'pageHead',
    label: 'Page header',
    note: 'Tiêu đề đầu mỗi trang.',
    options: [
      { value: 'rule', label: 'Rule', note: 'Rule dưới, mặc định.' },
      { value: 'banner', label: 'Banner', note: 'Nền accent nhạt.' },
      { value: 'mono', label: 'Mono', note: 'Tiêu đề mono, in hoa.' },
      { value: 'center', label: 'Center', note: 'Căn giữa.' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Defaults & helpers                                                  */
/* ------------------------------------------------------------------ */

export const DEFAULT_CUSTOMIZATION = {
  version: 1,
  themeId: 'protocol',
  typeId: 'journal',
  shapeId: 'drafted',
  accentOverride: null,
  effects: {
    motion: 'subtle',
    bg: 'radial',
    texture: 'none',
    cursor: 'none',
    hover: 'border',
  },
  components: {
    button: 'solid',
    card: 'sheet',
    input: 'line',
    tabs: 'underline',
    badge: 'tag',
    metric: 'strip',
    table: 'ruled',
    shell: 'pine',
    header: 'glass',
    pageHead: 'rule',
  },
};

const THEME_BY_ID = new Map(THEMES.map((theme) => [theme.id, theme]));
const TYPE_BY_ID = new Map(TYPE_PAIRS.map((pair) => [pair.id, pair]));
const SHAPE_BY_ID = new Map(SHAPES.map((shape) => [shape.id, shape]));
const EFFECT_VALUES = new Map(
  EFFECT_GROUPS.map((group) => [group.key, new Set(group.options.map((option) => option.value))]),
);
const COMPONENT_VALUES = new Map(
  COMPONENT_GROUPS.map((group) => [
    group.key,
    new Set(group.options.map((option) => option.value)),
  ]),
);

export function getTheme(id) {
  return THEME_BY_ID.get(id) || THEMES[0];
}

export function getTypePair(id) {
  return TYPE_BY_ID.get(id) || TYPE_PAIRS[0];
}

export function getShape(id) {
  return SHAPE_BY_ID.get(id) || SHAPES[1];
}

export function getAccentScale(theme, accentOverride) {
  if (theme.exact && !accentOverride) return PROTOCOL_ACCENT;
  return accentRamp(accentOverride || theme.accent);
}

export function getInkScale(theme) {
  return theme.exact ? PROTOCOL_INK : inkRamp(theme.ink);
}

export function getDangerScale(theme) {
  return theme.exact ? PROTOCOL_DANGER : accentRamp(theme.danger, { accessible: false });
}

export function getWarnScale(theme) {
  return theme.exact ? PROTOCOL_WARN : accentRamp(theme.warn, { accessible: false });
}

export function getOptionLabel(groupKey, value) {
  const group = EFFECT_GROUPS.find((item) => item.key === groupKey);
  return group?.options.find((option) => option.value === value)?.label || value;
}

export function getComponentLabel(groupKey, value) {
  const group = COMPONENT_GROUPS.find((item) => item.key === groupKey);
  return group?.options.find((option) => option.value === value)?.label || value;
}

export function normalizeCustomization(input) {
  const base = {
    ...DEFAULT_CUSTOMIZATION,
    effects: { ...DEFAULT_CUSTOMIZATION.effects },
    components: { ...DEFAULT_CUSTOMIZATION.components },
  };
  if (!input || typeof input !== 'object') return base;

  const next = {
    ...base,
    version: 1,
    themeId: THEME_BY_ID.has(input.themeId) ? input.themeId : base.themeId,
    typeId: TYPE_BY_ID.has(input.typeId) ? input.typeId : base.typeId,
    shapeId: SHAPE_BY_ID.has(input.shapeId) ? input.shapeId : base.shapeId,
    accentOverride: normalizeHex(input.accentOverride) || null,
  };

  for (const group of EFFECT_GROUPS) {
    const value = input.effects?.[group.key];
    if (EFFECT_VALUES.get(group.key)?.has(value)) next.effects[group.key] = value;
  }
  for (const group of COMPONENT_GROUPS) {
    const value = input.components?.[group.key];
    if (COMPONENT_VALUES.get(group.key)?.has(value)) next.components[group.key] = value;
  }

  return next;
}

export function countActiveEffects(effects) {
  let count = 0;
  if (effects.motion !== 'subtle') count += 1;
  if (effects.bg !== 'radial') count += 1;
  if (effects.texture !== 'none') count += 1;
  if (effects.cursor !== 'none') count += 1;
  if (effects.hover !== 'border') count += 1;
  return count;
}

export function countComponentChanges(components) {
  return Object.entries(DEFAULT_CUSTOMIZATION.components).filter(
    ([key, value]) => components[key] !== value,
  ).length;
}
