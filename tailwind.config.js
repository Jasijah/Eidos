/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#15201f',
        cloud: '#f6f8f7',
        line: '#dbe3df',
        teal: '#0e9f8d',
        coral: '#ef6f61',
        lime: '#b8dd6f'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif']
      },
      boxShadow: {
        soft: '0 18px 50px rgba(21, 32, 31, 0.08)'
      }
    }
  },
  plugins: []
};
