/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'mcd-primary':       '#0F4C5C',
        'mcd-secondary':     '#E36414',
        'mcd-accent':        '#FB8B24',
        'mcd-success':       '#2A9D8F',
        'mcd-warning':       '#E9C46A',
        'mcd-danger':        '#E76F51',
        'mcd-dark-bg':       '#0A1929',
        'mcd-dark-surface':  '#132F4C',
        'mcd-dark-border':   '#1E3A5F',
        'mcd-light-bg':      '#F8FAFC',
        'mcd-light-surface': '#FFFFFF',
        'mcd-light-border':  '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(135deg, #0F4C5C 0%, #0A1929 50%, #132F4C 100%)',
      },
      boxShadow: {
        'teal-glow':   '0 0 24px rgba(15, 76, 92, 0.5)',
        'amber-glow':  '0 0 24px rgba(251, 139, 36, 0.4)',
        'success-glow':'0 0 24px rgba(42, 157, 143, 0.4)',
        'danger-glow': '0 0 24px rgba(231, 111, 81, 0.4)',
        'card-dark':   '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-light':  '0 4px 24px rgba(15, 23, 42, 0.08)',
      },
      animation: {
        'breathe':      'breathe 3s ease-in-out infinite',
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up':     'slideUp 0.5s ease-out forwards',
        'fade-in':      'fadeIn 0.4s ease-out forwards',
        'count-up':     'countUp 1.2s ease-out forwards',
        'spin-slow':    'spin 8s linear infinite',
      },
      keyframes: {
        breathe:  {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%':       { transform: 'scale(1.15)', opacity: '1' },
        },
        slideUp:  {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn:   {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        countUp:  {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
