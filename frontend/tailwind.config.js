/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#FAFAFA',      // Premium off-white background
          warmBg: '#F8F7F4',  // Soft warm white background
          text: '#1F2937',    // Soft charcoal text
          gray: '#6B7280',    // Medium neutral gray
          peach: '#F5C6A5',   // Muted peach accent
          green: '#A7D7C5',   // Soft mint green accent
          beige: '#E9DDC9',   // Light beige neutral accent
          border: '#E5E7EB',  // Extremely light border gray
          accent: '#A7D7C5',  // Default accent
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 4px 20px -2px rgba(31, 41, 55, 0.05)',
        subtle: '0 2px 12px 0 rgba(31, 41, 55, 0.02)',
      },
      borderRadius: {
        'premium': '16px',
      }
    },
  },
  plugins: [],
}
