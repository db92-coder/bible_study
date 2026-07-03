/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#f6f1e7',
          50: '#fbf8f2',
          100: '#f6f1e7',
          200: '#ece3d0',
          300: '#ddcfae',
          700: '#3f3a30',
          800: '#2e2a23',
          900: '#211d17',
        },
        ink: {
          DEFAULT: '#2b2118',
          soft: '#4a3f33',
          faint: '#8a7d6a',
          invert: '#ece5d8',
        },
        gold: {
          DEFAULT: '#b48a3c',
          soft: '#d9b56d',
        },
        teal: {
          DEFAULT: '#2f6f6a',
          deep: '#1f4f4b',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
