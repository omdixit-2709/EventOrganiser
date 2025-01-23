/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
      "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
      extend: {
          colors: {
              dark: {
                  DEFAULT: '#1a1a1a',
                  100: '#2d2d2d',
                  200: '#404040',
                  300: '#535353',
                  400: '#666666',
                  500: '#808080',
              }
          }
      },
  },
  plugins: [],
}