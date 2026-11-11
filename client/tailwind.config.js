/** @type {import('tailwindcss').Config} */
const pine = {
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

const vermilion = {
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

const ochre = {
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

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Warm clinical neutrals — replaces the cool slate ramp app-wide.
        slate: {
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
        },
        white: '#fffdf7',
        black: '#0b0f0d',
        pine,
        brand: pine,
        emerald: pine,
        teal: pine,
        vermilion,
        rose: vermilion,
        ochre,
        amber: ochre,
        orange: ochre,
        lime: ochre,
        sky: clinicalBlue,
        paper: '#f5f6f2',
        'paper-2': '#edefe9',
        surface: '#fefffc',
        'surface-2': '#eef0ea',
        shell: '#0e1713',
        'shell-2': '#16231e',
        'shell-ink': '#e8e5db',
        line: '#d8ddd4',
        'line-strong': '#c3c9bf',
      },
      fontFamily: {
        sans: [
          '"Be Vietnam Pro"',
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
        display: ['"Source Serif 4"', 'Georgia', 'Cambria', 'serif'],
        mono: ['"Roboto Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        xl: '10px',
        '2xl': '12px',
        '3xl': '14px',
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
