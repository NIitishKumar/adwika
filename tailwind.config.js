/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        adwika: {
          black: '#080808',
          dark: '#0f0f11',
          surface: '#151518',
          sand: '#cbaf94',
          sandHover: '#b89c82',
          greige: '#c7c6bf',
          greigeHover: '#b5b4ad',
          sage: '#aab09b',
          sageHover: '#989e89',
          cream: '#f6f4ee',
          creamDark: '#eeeae0',
          gold: '#cbb094',
          goldBright: '#dfc6ab',
          bindi: '#d9232a',
          muted: '#8e8b85',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      letterSpacing: {
        'widest-xl': '0.25em',
        'widest-2xl': '0.35em',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        slideDown: 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
}
