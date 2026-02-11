/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fondo: '#1a0509',
        vinotinto: '#6B1021',
        dorado: '#D4AF37',
      },
    },
  },
  plugins: [],
}
