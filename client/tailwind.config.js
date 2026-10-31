/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf7',
          100: '#d1fae9',
          200: '#a7f3d5',
          300: '#6ee7bd',
          400: '#34d39f',
          500: '#10b981',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
      },
      fontFamily: {
        sans: [
          'Be Vietnam Pro',
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: [
          'Be Vietnam Pro',
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [],
};
