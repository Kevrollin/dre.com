/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        de: {
          bg: '#F8F7F3',
          surface: '#FFFFFF',
          text: '#151515',
          muted: '#6F6F6A',
          border: '#E7E5DE',
          accent: '#9A3B23',
          accentDark: '#7A2E1B',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
