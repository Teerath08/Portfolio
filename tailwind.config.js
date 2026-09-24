/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#030303",
        'cyber-black': "#070709",
        crimson: {
          50: '#fff1f2',
          100: '#ffe4e6',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-3d': 'float3D 5s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'gradient': 'gradientShift 4s ease infinite',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'thunder-flash': 'thunderFlash 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        float3D: {
          '0%, 100%': { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) translateZ(0px)' },
          '25%': { transform: 'perspective(1000px) rotateX(4deg) rotateY(-3deg) translateY(-8px) translateZ(12px)' },
          '75%': { transform: 'perspective(1000px) rotateX(-3deg) rotateY(4deg) translateY(-4px) translateZ(8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 15px rgba(239,68,68,0.4))' },
          '50%': { opacity: '0.9', filter: 'drop-shadow(0 0 30px rgba(239,68,68,0.8))' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        thunderFlash: {
          '0%': { opacity: '0.95' },
          '20%': { opacity: '0.3' },
          '40%': { opacity: '0.9' },
          '100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
