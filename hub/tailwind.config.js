/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.ejs', './public/**/*.js'],
  darkMode: 'class', // Ou media se preferir, mas como o Linktree é escuro por defeito vamos deixar 'class' e não forçar o html
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
