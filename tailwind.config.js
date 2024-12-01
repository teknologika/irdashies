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
    },
  },
  plugins: [],
};
