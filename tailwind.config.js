/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#e63946',
          black: '#1a1a1a',
          white: '#FFFFFF',
          darkGray: '#151515',
          lightGray: '#F5F5F5',
          creamPrimary: '#fdf6f0',
          creamWarm: '#fdf6f0',
          creamSecondary: '#fbf1e8',
          redAccent: '#e63946',
          crimsonAccent: '#d62232',
          charcoalDark: '#1a1a1a',
          charcoalMedium: '#444444',
        }
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-33.333%, 0, 0)' },
        }
      }
    },
  },
  plugins: [],
}
