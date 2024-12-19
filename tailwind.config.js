/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Lato"', 'sans-serif'],
      },
      fontSize: {
        xs: '10px',
        sm: '12px',
      },
      keyframes: {
        'pulse-border': {
          '0%': { borderWidth: '2px', opacity: '1' },
          '50%': { borderWidth: '2px', opacity: '0.8' },
          '100%': { borderWidth: '2px', opacity: '1' },
        },
      },
      animation: {
        'pulse-border': 'pulse-border 1s infinite',
      },
    },
  },
  plugins: [],
};
