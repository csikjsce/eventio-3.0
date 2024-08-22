/** @type {import('tailwindcss').Config} */


const withMT = require("@material-tailwind/react/utils/withMT");
module.exports = withMT({
  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
      'background-light': '#fff',
      'foreground-light': '#231F20',
      'card-light': '#F3F3F3',
      'mute-text-light': '#57585A',

      'background-dark': '#231F20',
      'foreground-dark': '#fff',
      'card-dark': '#343434',
      'mute-text-dark': '#878787',

      primary: '#B61F2D',
      gray: {
          1: '#57585A',
          20: '#57585A20',
      },
      'vitality-red': '#EE1D23',
      orange: '#F58220',
      darkorange: 'rgba(245, 130, 32, 0.1)',
      yellow: '#FFCB05',

      'green-light': '#34B84A',
      'light-brown-light': '#A25723',
      'dark-brown-light': '#603312',

      'green-dark': '#278A38',
      'light-brown-dark': '#FFCB05',
      'dark-brown-dark': '#603312',

      white: '#FFFFFF',
      black: '#231F20',

      disabled: '#dcdcdc',
      'disabled-dark': '#3c3c3c',
    },
    fontFamily: {
      marcellus: "Marcellus",
      fira: ["Fira Sans", "sans-serif"],
      poppins: "Poppins",
    }
  },
    

  },
  plugins: [],
});

