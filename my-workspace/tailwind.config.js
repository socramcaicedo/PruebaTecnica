/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./projects/demo-app/src/**/*.{html,ts}",
    "./projects/ui-lib/src/lib/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        rick: {
          green: '#39FF14',
          portal: '#11E0AA',
        },
        dimension: {
          bg: '#0D1117',
          card: '#161B22',
          border: '#30363D',
          hover: '#1C2333',
        }
      },
      fontFamily: {
        morty: ['"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      }
    },
  },
  plugins: [],
}
