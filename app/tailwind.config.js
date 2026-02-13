/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        calm: {
          900: '#0a0e12',
          800: '#0f1419',
          700: '#1a2332',
          600: '#2a3f5f',
          accent: '#4fd1c5',
          highlight: '#81e6d9',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'breathe-in': 'breathIn 4s ease-in-out',
        'breathe-out': 'breathOut 4s ease-in-out',
        'breathe-hold': 'breathHold 4s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        breathIn: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.2)' }
        },
        breathOut: {
          '0%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' }
        },
        breathHold: {
          '0%, 100%': { transform: 'scale(1)' }
        }
      }
    },
  },
  plugins: [],
}
