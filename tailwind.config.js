/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#ee2737', // Pantone 1788C
          purple: '#9b26b6', // Pantone 2592C
          yellow: '#ffcd00', // Pantone 116C
          blue: '#22007c', // Pantone 2735C
          black: '#212322', // Pantone 419C
          light: '#f8fafc',
          gray: '#64748b',
          border: '#e2e8f0',
        }
      },
      borderRadius: {
        'xl': '12px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 25px -3px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
