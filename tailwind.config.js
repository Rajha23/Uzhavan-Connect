/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        earth: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        forest: '#0a2e1f',
        sage: '#34d399',
        olive: '#e2e8f0',
        cream: '#f8faf9',
        moss: '#10b981',
      },
      fontFamily: {
        sans: ['"Google Sans"', '"Google Sans Text"', '"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        heading: ['"Google Sans"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Google Sans"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        anton: ['"Google Sans"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'forest': '0 4px 20px -2px rgba(10, 46, 31, 0.08)',
        'forest-lg': '0 10px 25px -5px rgba(10, 46, 31, 0.12)',
        'ai-card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'ai-hover': '0 10px 25px -5px rgba(16, 185, 129, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
