/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Matiks exact palette
        'lime':          '#C8F135',
        'lime-dark':     '#A8D010',
        'campus-black':  '#000000',
        'campus-card':   '#1C1C1C',
        'campus-border': '#2a2a2a',
        'campus-cyan':   '#00D4C8',
        'campus-pink':   '#E040FB',
        'campus-green':  '#4CAF50',
        'campus-orange': '#FF6B00',
        // Legacy neon names (kept for existing pages)
        'neon-green':    '#C8F135',
        'neon-cyan':     '#00D4C8',
        'neon-pink':     '#E040FB',
        'neon-orange':   '#FF6B00',
        'neon-blue':     '#1565C0',
        'dark-900':      '#000000',
        'dark-800':      '#0A0A0A',
        'dark-700':      '#111111',
        'dark-600':      '#1A1A1A',
        'dark-500':      '#222222',
      },
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        body:    ['Barlow', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        sans:    ['Barlow', 'system-ui', '-apple-system', 'sans-serif'],
        condensed: ['Barlow Condensed', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'lime':       '0 0 20px rgba(200,241,53,0.5)',
        'neon-green': '0 0 20px rgba(200,241,53,0.5)',
        'neon-cyan':  '0 0 20px rgba(0,212,200,0.5)',
        'neon-pink':  '0 0 20px rgba(224,64,251,0.5)',
        'glow-sm':    '0 0 8px rgba(200,241,53,0.4)',
        'glow-md':    '0 0 20px rgba(200,241,53,0.5)',
        'glow-lg':    '0 0 40px rgba(200,241,53,0.6)',
        'card':       '0 1px 3px rgba(0,0,0,0.6)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.8)',
        'modal':      '0 20px 60px rgba(0,0,0,0.9)',
      },
      animation: {
        'ping-slow':   'ping 2s cubic-bezier(0,0,0.2,1) infinite',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow':        'glow 2s ease-in-out infinite alternate',
        'float':       'float 6s ease-in-out infinite',
        'shimmer':     'shimmer 1.8s ease-in-out infinite',
        'radar':       'radar 2s ease-out infinite',
        'shake':       'shake 0.4s ease-in-out',
      },
      keyframes: {
        glow: {
          '0%':   { boxShadow: '0 0 5px rgba(200,241,53,0.4)' },
          '100%': { boxShadow: '0 0 25px rgba(200,241,53,0.8)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        radar: {
          '0%':   { transform: 'scale(0)', opacity: 1 },
          '100%': { transform: 'scale(2)', opacity: 0 },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%':     { transform: 'translateX(-4px)' },
          '40%':     { transform: 'translateX(4px)' },
          '60%':     { transform: 'translateX(-4px)' },
          '80%':     { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [],
}
