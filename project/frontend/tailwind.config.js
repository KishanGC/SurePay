export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          200: '#bce4ff',
          300: '#8ed2ff',
          400: '#5cb8ff',
          500: '#3b9bff',
          600: '#237df2',
          700: '#1d63dd',
          800: '#1f52b8',
          900: '#214794',
        },
      },
      boxShadow: {
        soft: '0 20px 50px -20px rgba(15, 23, 42, 0.25)',
      },
    },
  },
  plugins: [],
}
