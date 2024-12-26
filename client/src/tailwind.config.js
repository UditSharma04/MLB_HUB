/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mlb: {
          blue: '#002D72',
          red: '#E31837',
          navy: '#041E42',
          gray: '#969EA7'
        }
      }
    },
  },
  plugins: [],
}