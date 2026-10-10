/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent1: {
          DEFAULT: '#0d9488',
          dark: '#0f766e',
          light: '#14b8a6',
          50: '#f0fdfa',
          100: '#ccfbf1',
        },
        accent2: '#EB001B',
        accent3: '#22C55E',
        navy: {
          DEFAULT: '#0B1F3A',
          dark: '#061325',
          light: '#132f54',
        },
        primary: {
          DEFAULT: '#0d9488',
          light: '#14b8a6',
          dark: '#0f766e',
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          500: '#0d9488',
          600: '#0f766e',
          700: '#115e59',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          background: '#F8FAFC',
          muted: '#F1F5F9',
        },
        content: {
          DEFAULT: '#1E293B',
          secondary: '#64748B',
          light: '#94A3B8',
          subtle: '#CBD5E1',
        },
        border: '#E2E8F0',
        status: {
          success: '#10B981',
          'success-light': '#D1FAE5',
          error: '#EF4444',
          'error-light': '#FEE2E2',
          warning: '#F59E0B',
          'warning-light': '#FEF3C7',
          info: '#3B82F6',
          'info-light': '#DBEAFE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 4px 20px -2px rgba(0, 110, 255, 0.12)',
        'brand-lg': '0 10px 25px -3px rgba(0, 110, 255, 0.18)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 20px -5px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
