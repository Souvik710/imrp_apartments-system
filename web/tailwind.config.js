/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hotel: {
          dark: '#0a0a0f',
          charcoal: '#1a1a2e',
          panel: '#16213e',
          blue: '#0ea5e9',
          gold: '#d4a742',
          goldLight: '#f0d78c',
          accent: '#38bdf8',
          muted: '#64748b',
          success: '#22c55e',
          danger: '#ef4444',
          warning: '#f59e0b',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
