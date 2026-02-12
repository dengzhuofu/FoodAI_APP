/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: {
            50: '#eff6ff', // Blue-50
            100: '#dbeafe',
            500: '#3b82f6', // Blue-500
            600: '#2563eb', // Blue-600 (Lark Blue-ish)
            700: '#1d4ed8',
        },
        slate: {
            50: '#f5f6f7', // Lark background gray
            100: '#ebedf0',
            200: '#dee0e3', // Lark border
            300: '#cfd3d8',
            800: '#1f2329', // Lark text dark
            900: '#000000',
        }
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)', // Softer shadow
      }
    },
  },
  plugins: [],
}
