/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'mcd-primary': '#0F4C5C',
        'mcd-secondary': '#E36414',
        'mcd-accent': '#FB8B24',
        'mcd-success': '#2A9D8F',
        'mcd-warning': '#E9C46A',
        'mcd-danger': '#E76F51',
        'mcd-dark-bg': '#0A1929',
        'mcd-dark-surface': '#132F4C',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
