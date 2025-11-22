/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        neonPink: '#f72585',
        neonPurple: '#7209b7',
        neonBlue: '#4361ee',
        neonOrange: '#f77f00',
      },
    },
  },
  plugins: [],
}
