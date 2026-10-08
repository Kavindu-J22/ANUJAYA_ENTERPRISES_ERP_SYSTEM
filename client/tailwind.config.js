/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '"Noto Sans Sinhala"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Noto Sans Sinhala"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        carbon: {
          950: '#06090e',
          900: '#0a0e17',
          850: '#101623',
          800: '#161f31',
          750: '#1e2b44',
          700: '#283858',
          600: '#384b70'
        },
        eyesafe: {
          950: '#0A0F1D',
          900: '#0F172A',
          850: '#15203B',
          800: '#1E293B',
          750: '#283853',
          700: '#334155'
        },
        anujaya: {
          DEFAULT: '#0ea5e9',
          glow: '#0284c7',
          bg: 'rgba(14, 165, 233, 0.12)'
        },
        global: {
          DEFAULT: '#10b981',
          glow: '#059669',
          bg: 'rgba(16, 185, 129, 0.12)'
        },
        brand: {
          400: '#38bdf8',
          500: '#0284c7',
          600: '#0369a1'
        },
        accent: {
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2'
        },
        leaf: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669'
        }
      }
    },
  },
  plugins: [],
}
