/**
 * Ảnh SVG cho các component 3D ở trang giới thiệu.
 * Dùng data URL để không phải thêm asset nhị phân; vẫn giữ đúng palette
 * PT Brain (pine / ochre / paper) và nội dung module hiện tại.
 */

const PINE_LIGHT = '#5fbf9e';
const OCHRE = '#c19234';
const PAPER = '#f5f6f2';
const INK = '#07110d';

const encode = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

const escapeXmlText = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const contours = (count = 6, color = PAPER, opacity = 0.08) =>
  Array.from({ length: count }, (_, index) => {
    const y = 210 + index * 82;
    const bend = 90 + index * 7;
    return `<path d="M-40 ${y} C 150 ${y - bend}, 330 ${y + bend}, 520 ${y - 24} S 760 ${y - 48}, 940 ${y - 12}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.2"/>`;
  }).join('');

const iconFor = (index, color = PAPER) => {
  const common = `fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"`;
  switch (index) {
    case 0:
      return `<g ${common} opacity="0.9">
        <rect x="292" y="326" width="182" height="228" rx="18" />
        <path d="M330 370h106M330 410h86M330 450h106M330 490h64" opacity="0.7" />
        <circle cx="512" cy="524" r="58" />
        <path d="m552 568 48 48" />
      </g>`;
    case 1:
      return `<g ${common} opacity="0.9">
        <path d="M270 610V330M270 610h250" opacity="0.45" />
        <path d="m300 548 58-58 44 26 64-96 48 38 62-58" />
        <circle cx="358" cy="490" r="10" fill="${color}" stroke="none" />
        <circle cx="466" cy="420" r="10" fill="${color}" stroke="none" />
        <circle cx="576" cy="400" r="10" fill="${color}" stroke="none" />
      </g>`;
    case 2:
      return `<g ${common} opacity="0.9">
        <path d="M300 470h180M330 430v80M450 430v80M390 408v124M270 446h30M540 446h30" />
        <path d="M318 470h-28M486 470h28" opacity="0.5" />
      </g>`;
    case 3:
      return `<g ${common} opacity="0.9">
        <circle cx="420" cy="470" r="118" />
        <circle cx="420" cy="470" r="72" opacity="0.45" />
        <path d="M290 332v168M270 332v76M310 332v76" />
        <path d="M546 332v168M526 332v58c0 26 14 40 20 40s20-14 20-40v-58" opacity="0.7" />
      </g>`;
    case 4:
      return `<g ${common} opacity="0.9">
        <circle cx="420" cy="470" r="138" opacity="0.4" />
        <path d="M420 332v210M350 372c30 26 110 26 140 0M324 470c48-20 144-20 192 0M346 566c40 20 108 20 148 0" />
      </g>`;
    case 5:
    default:
      return `<g ${common} opacity="0.9">
        <rect x="280" y="360" width="220" height="170" rx="20" opacity="0.45" />
        <rect x="326" y="398" width="220" height="170" rx="20" />
        <path d="M364 448h100M364 486h78M364 524h94" opacity="0.7" />
        <path d="M566 382v72M566 382l-18 24M566 382l18 24" opacity="0.5" />
      </g>`;
  }
};

const baseGradient = (id, start, end) => `
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="${start}" />
      <stop offset="1" stop-color="${end}" />
    </linearGradient>
    <radialGradient id="${id}-glow" cx="0.28" cy="0.18" r="0.8">
      <stop stop-color="${PINE_LIGHT}" stop-opacity="0.32" />
      <stop offset="1" stop-color="${PINE_LIGHT}" stop-opacity="0" />
    </radialGradient>
  </defs>`;

const featurePalette = [
  [INK, '#0a3b2e'],
  ['#0a1a16', '#0e4a3a'],
  ['#10130f', '#223a2b'],
  ['#0b1813', '#3a2d13'],
  ['#0a1620', '#123b38'],
  ['#0b120e', '#2d3a1a'],
];

export const featureGalleryItems = [
  'Research Reader',
  'Body Log',
  'Training Planner',
  'Nutrition',
  'Human Atlas 3D',
  'Learn & Review',
].map((text, index) => {
  const [start, end] = featurePalette[index];
  const id = `feature-${index}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="900" viewBox="0 0 700 900">
    ${baseGradient(id, start, end)}
    <rect width="700" height="900" fill="url(#${id})" />
    <rect width="700" height="900" fill="url(#${id}-glow)" />
    <g opacity="0.8">${contours(7)}</g>
    <g opacity="0.5" stroke="${PAPER}" stroke-width="1">
      ${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 88} 0v900" opacity="0.05"/>`).join('')}
      ${Array.from({ length: 11 }, (_, i) => `<path d="M0 ${i * 88}h700" opacity="0.05"/>`).join('')}
    </g>
    <circle cx="580" cy="160" r="112" fill="none" stroke="${OCHRE}" stroke-opacity="0.32" stroke-width="1.5" stroke-dasharray="2 10" />
    <circle cx="580" cy="160" r="7" fill="${OCHRE}" fill-opacity="0.8" />
    <text x="54" y="72" font-family="Georgia, serif" font-size="16" letter-spacing="4" fill="${PINE_LIGHT}" opacity="0.8">PT BRAIN / MODULE</text>
    <text x="48" y="790" font-family="Georgia, serif" font-size="188" font-weight="700" fill="${PAPER}" opacity="0.1">0${index + 1}</text>
    ${iconFor(index)}
    <text x="54" y="844" font-family="'Be Vietnam Pro', Arial, sans-serif" font-size="24" font-weight="600" fill="${PAPER}" opacity="0.92">${escapeXmlText(text)}</text>
  </svg>`;
  return { image: encode(svg), text };
});

const phaseNames = ['Đọc', 'Hiểu', 'Áp dụng', 'Đo lại'];

export const phaseSpiralItems = phaseNames.map((label, index) => {
  const id = `phase-${index}`;
  const accent = index % 2 === 0 ? PINE_LIGHT : OCHRE;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="520" viewBox="0 0 520 520">
    ${baseGradient(id, INK, index % 2 === 0 ? '#0b3d30' : '#2d2614')}
    <rect width="520" height="520" fill="url(#${id})" />
    <rect width="520" height="520" fill="url(#${id}-glow)" />
    <g opacity="0.55">${contours(4, PAPER, 0.1)}</g>
    <circle cx="260" cy="260" r="166" fill="none" stroke="${accent}" stroke-opacity="0.34" stroke-width="1.4" stroke-dasharray="2 12" />
    <circle cx="260" cy="260" r="206" fill="none" stroke="${PAPER}" stroke-opacity="0.12" stroke-width="1" />
    <text x="42" y="66" font-family="Georgia, serif" font-size="15" letter-spacing="4" fill="${PAPER}" opacity="0.55">0${index + 1} / 04</text>
    <text x="260" y="282" text-anchor="middle" font-family="'Be Vietnam Pro', Arial, sans-serif" font-size="54" font-weight="600" fill="${PAPER}">${label}</text>
    <text x="260" y="330" text-anchor="middle" font-family="'Be Vietnam Pro', Arial, sans-serif" font-size="14" letter-spacing="3" fill="${accent}" opacity="0.9">PT BRAIN LOOP</text>
    <circle cx="260" cy="260" r="10" fill="${accent}" fill-opacity="0.8" />
  </svg>`;
  return { src: encode(svg), alt: `${label} — vòng lặp huấn luyện`, label };
});

export const protocolCardImage = encode(`<svg xmlns="http://www.w3.org/2000/svg" width="760" height="980" viewBox="0 0 760 980">
  ${baseGradient('protocol', '#07110d', '#0d3b2d')}
  <rect width="760" height="980" fill="url(#protocol)" />
  <rect width="760" height="980" fill="url(#protocol-glow)" />
  <g opacity="0.5">${contours(8)}</g>
  <rect x="48" y="48" width="664" height="884" rx="28" fill="none" stroke="${PAPER}" stroke-opacity="0.16" stroke-width="1.2" />
  <text x="88" y="124" font-family="Georgia, serif" font-size="18" letter-spacing="5" fill="${PINE_LIGHT}">PT BRAIN / PROTOCOL</text>
  <text x="88" y="300" font-family="Georgia, serif" font-size="72" fill="${PAPER}">Đọc</text>
  <text x="88" y="390" font-family="Georgia, serif" font-size="72" fill="${PAPER}">Hiểu</text>
  <text x="88" y="480" font-family="Georgia, serif" font-size="72" fill="${PAPER}">Áp dụng</text>
  <text x="88" y="570" font-family="Georgia, serif" font-size="72" fill="${OCHRE}">Đo lại</text>
  <path d="M88 650h440" stroke="${PAPER}" stroke-opacity="0.18" />
  <text x="88" y="708" font-family="'Be Vietnam Pro', Arial, sans-serif" font-size="20" fill="${PAPER}" opacity="0.72">Evidence → Protocol</text>
  <circle cx="620" cy="826" r="64" fill="none" stroke="${PINE_LIGHT}" stroke-opacity="0.4" />
  <circle cx="620" cy="826" r="6" fill="${PINE_LIGHT}" />
</svg>`);
