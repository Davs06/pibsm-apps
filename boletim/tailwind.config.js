/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.ejs', './public/**/*.js'],
  darkMode: 'class', // Força o modo claro (desativa o dark mode automático)
  theme: {
    extend: {
      colors: {
        cream: '#f5f0e8',
        dark: '#0d1b2e',
        gold: '#c9a84c',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
