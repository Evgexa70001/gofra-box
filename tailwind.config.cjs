/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#FF6B01',
        'secondary': '#2568fb',
        'dark': '#353535',
        'light': '#FFFFFF',
      }
    },
  },
  plugins: [],
}