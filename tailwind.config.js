/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          500: '#d4af37',
          600: '#aa8c2c',
        }
      }
    },
  },
  plugins: [],
}
