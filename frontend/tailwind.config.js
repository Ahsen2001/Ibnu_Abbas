/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        college: {
          ink: '#172126',
          deep: '#142326',
          green: '#0f766e',
          gold: '#b7791f',
          mist: '#f5f7f6',
        },
      },
      boxShadow: {
        soft: '0 12px 32px rgba(20, 35, 38, 0.08)',
      },
    },
  },
  plugins: [],
}
