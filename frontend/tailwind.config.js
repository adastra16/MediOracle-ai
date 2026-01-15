/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ff79c6',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        accent: {
          light: '#ffb3d9',
          DEFAULT: '#ff79c6',
          dark: '#ff4da6',
          neon: '#ff1493',
          soft: '#ffd1e8',
          glow: '#ff69b4',
        },
        surface: {
          light: '#fff5f9',
          DEFAULT: '#ffeef5',
          dark: '#ffe4ef',
          glass: 'rgba(255, 255, 255, 0.15)',
        },
        text: {
          primary: '#2d1f3d',
          secondary: '#6b5b7a',
          muted: '#9d8ba7',
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'pink-sm': '0 2px 8px rgba(255, 121, 198, 0.25)',
        'pink-md': '0 4px 16px rgba(255, 121, 198, 0.3)',
        'pink-lg': '0 8px 32px rgba(255, 121, 198, 0.35)',
        'pink-xl': '0 16px 48px rgba(255, 121, 198, 0.4)',
        'pink-glow': '0 0 40px rgba(255, 121, 198, 0.5)',
        'neon': '0 0 20px rgba(255, 20, 147, 0.6), 0 0 40px rgba(255, 20, 147, 0.3)',
        'float': '0 20px 60px rgba(0, 0, 0, 0.1)',
        'card': '0 10px 40px rgba(255, 121, 198, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'inner-glow': 'inset 0 0 30px rgba(255, 121, 198, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
        'pink-gradient': 'linear-gradient(135deg, #ff79c6 0%, #ff4da6 50%, #ff1493 100%)',
        'pink-soft': 'linear-gradient(135deg, #ffeef5 0%, #ffd1e8 50%, #ffb3d9 100%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
        'mesh': `
          radial-gradient(at 40% 20%, rgba(255, 121, 198, 0.3) 0px, transparent 50%),
          radial-gradient(at 80% 0%, rgba(255, 77, 166, 0.2) 0px, transparent 50%),
          radial-gradient(at 0% 50%, rgba(255, 179, 217, 0.3) 0px, transparent 50%),
          radial-gradient(at 80% 50%, rgba(255, 20, 147, 0.15) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(255, 209, 232, 0.3) 0px, transparent 50%),
          radial-gradient(at 80% 100%, rgba(255, 121, 198, 0.2) 0px, transparent 50%)
        `,
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'pulse-pink': 'pulse-pink 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 20s linear infinite',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'tilt': 'tilt 10s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-pink': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 121, 198, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 121, 198, 0.8)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(255, 121, 198, 0.4)' },
          '100%': { boxShadow: '0 0 40px rgba(255, 20, 147, 0.6)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        tilt: {
          '0%, 100%': { transform: 'rotateY(-5deg) rotateX(5deg)' },
          '50%': { transform: 'rotateY(5deg) rotateX(-5deg)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
