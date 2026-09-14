/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#01472e',
          50: '#eef6f2',
          100: '#d5e7dd',
          200: '#aecdbf',
          300: '#80af9d',
          400: '#54907a',
          500: '#31725b',
          600: '#1c5b45',
          700: '#01472e',
          800: '#013b26',
          900: '#002f1e',
          950: '#001b11',
        },
        sage: {
          DEFAULT: '#ccd5ae',
          50: '#f7f9f2',
          100: '#eef2e1',
          200: '#ccd5ae',
          300: '#b9c595',
          400: '#a2b078',
          500: '#88975e',
          600: '#6d7b47',
        },
        olive: {
          DEFAULT: '#e9edc9',
          50: '#fcfdf7',
          100: '#f7faee',
          200: '#e9edc9',
          300: '#dbe2a4',
        },
        cream: {
          DEFAULT: '#fefae0',
          50: '#fffdf5',
          100: '#fefae0',
          200: '#fcf4be',
          300: '#faec9a',
        },
        moss: {
          DEFAULT: '#a3b18a',
          50: '#f4f6f1',
          100: '#e4e8dc',
          200: '#c8d2ba',
          300: '#a3b18a',
          400: '#86966d',
          500: '#697753',
        },
        mint: {
          DEFAULT: '#eaf4ec',
          50: '#f4f9f5',
          100: '#eaf4ec',
          200: '#d5ebd9',
        },
        canvas: '#faf9f5',
        'surface-cream': '#fdfbf7',
        'surface-pale': '#f5f8f5',
        'text-forest': '#01472e',
        'text-muted': '#5c7065',
      },
      borderRadius: {
        '2xl': '1.25rem',  // 20px
        '3xl': '1.75rem',  // 28px
        '4xl': '2.25rem',  // 36px
        '5xl': '2.75rem',  // 44px
      },
      fontFamily: {
        sans: ['"Google Sans"', '"Google Sans Text"', '"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        heading: ['"Google Sans"', '"Google Sans Text"', '"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Google Sans"', '"Google Sans Text"', '"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(1, 71, 46, 0.04)',
        '2xs': '0 1px 1px 0 rgba(1, 71, 46, 0.03)',
        'soft': '0 4px 20px -2px rgba(1, 71, 46, 0.05)',
        'forest': '0 8px 30px -4px rgba(1, 71, 46, 0.08)',
        'forest-lg': '0 16px 40px -6px rgba(1, 71, 46, 0.12)',
        'forest-xl': '0 24px 50px -10px rgba(1, 71, 46, 0.15)',
        'ai-card': '0 2px 10px 0 rgba(1, 71, 46, 0.04)',
        'ai-hover': '0 12px 32px -4px rgba(1, 71, 46, 0.12), 0 4px 12px -2px rgba(1, 71, 46, 0.06)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        marquee: 'marquee 35s linear infinite',
      }
    },
  },
  plugins: [],
}
