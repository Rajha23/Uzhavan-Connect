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
        forest: '#01472e',
        sage: '#ccd5ae',
        olive: '#e9edc9',
        cream: '#fefae0',
        moss: '#a3b18a',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        anton: ['Anton', 'sans-serif'],
      },
      boxShadow: {
        'forest': '0 4px 20px -2px rgba(1, 71, 46, 0.2)',
        'forest-lg': '0 10px 25px -5px rgba(1, 71, 46, 0.2)',
      }
    },
  },
  plugins: [],
}
