/** @type {import('tailwindcss').Config} */

// Mọi token màu đi qua CSS variable để Theme Studio có thể đổi toàn bộ giao
// diện ngay lập tức. Giá trị fallback nằm trong index.css :root / .dark.
const token = (name) => `rgb(var(${name}) / <alpha-value>)`;
const scale = (prefix) =>
  Object.fromEntries(
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((step) => [
      step,
      token(`--ts-${prefix}-${step}`),
    ]),
  );

const pine = scale('accent');

const clinicalBlue = {
  50: '#eef3f8',
  100: '#dbe6f0',
  200: '#b9cde0',
  300: '#8faccc',
  400: '#6489b3',
  500: '#3f6d9c',
  600: '#2f5d8a',
  700: '#264a6d',
  800: '#1d3a55',
  900: '#152a3d',
  950: '#0b1824',
};

// Success độc lập với accent: đúng/sai trong quiz, cảnh báo tích cực…
// không được đổi sang đỏ khi người dùng chọn theme đỏ/hồng.
const successGreen = {
  50: '#edf7f0',
  100: '#d7eddc',
  200: '#b0d9bc',
  300: '#82bf95',
  400: '#55a06e',
  500: '#3a8455',
  600: '#2c6a43',
  700: '#245436',
  800: '#1d432b',
  900: '#163422',
  950: '#0b1d13',
};

const radius = (px) => `calc(${px}px * var(--ts-radius, 1))`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        slate: scale('ink'),
        pine,
        brand: pine,
        emerald: successGreen,
        teal: pine,
        vermilion: scale('danger'),
        rose: scale('danger'),
        ochre: scale('warn'),
        amber: scale('warn'),
        orange: scale('warn'),
        lime: scale('warn'),
        sky: clinicalBlue,
        white: '#fffdf7',
        black: '#0b0f0d',
        paper: token('--ts-paper'),
        'paper-2': token('--ts-paper-2'),
        surface: token('--ts-surface'),
        'surface-2': token('--ts-surface-2'),
        'surface-deep': token('--ts-surface-deep'),
        'page-deep': token('--ts-page-deep'),
        shell: token('--ts-shell'),
        'shell-2': token('--ts-shell-2'),
        'shell-ink': token('--ts-shell-ink'),
        line: token('--ts-line'),
        'line-strong': token('--ts-line-strong'),
      },
      fontFamily: {
        sans: ['var(--ts-font-sans)'],
        display: ['var(--ts-font-display)'],
        mono: ['var(--ts-font-mono)'],
      },
      borderRadius: {
        sm: radius(3),
        DEFAULT: radius(4),
        md: radius(6),
        lg: radius(8),
        xl: radius(10),
        '2xl': radius(12),
        '3xl': radius(14),
      },
      boxShadow: {
        panel: '0 1px 2px rgba(20, 25, 23, 0.04)',
        overlay: '0 24px 48px -24px rgba(11, 15, 13, 0.45), 0 4px 12px -6px rgba(11, 15, 13, 0.18)',
        soft: '0 8px 24px -18px rgba(11, 15, 13, 0.35)',
      },
      keyframes: {
        settle: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        settle: 'settle 220ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-dot': 'pulseDot 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
