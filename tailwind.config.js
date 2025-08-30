/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#FEF3C7',
          text: '#1E1E1E',
          accent: '#FBBF24',
        },
      },
      boxShadow: {
        'hard': '4px 4px 0 rgba(30,30,30,1)',
      },
      fontFamily: {
        'mono': ['Courier New', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
}
