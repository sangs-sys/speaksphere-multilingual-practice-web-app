/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Poppins', 'system-ui', 'sans-serif'] },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        pop: { '0%': { transform: 'scale(.85)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
        rise: { '0%': { transform: 'translateY(14px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        pulseRing: { '0%': { boxShadow: '0 0 0 0 rgba(239,68,68,.5)' }, '100%': { boxShadow: '0 0 0 18px rgba(239,68,68,0)' } },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        pop: 'pop .45s ease-out both',
        rise: 'rise .5s ease-out both',
        ring: 'pulseRing 1.2s infinite',
      },
    },
  },
  plugins: [],
};
