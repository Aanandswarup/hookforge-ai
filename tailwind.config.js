/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Linear / Vercel Ultra-Dark Surface Hierarchy
        surface: {
          base: '#090d16',
          card: '#0d131f',
          elevated: '#111827',
          well: '#070b12',
          border: '#1e293b',
          'border-subtle': '#162032',
          'border-highlight': 'rgba(255, 255, 255, 0.08)',
          highlight: 'rgba(255, 255, 255, 0.04)',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        dark: {
          950: '#050811',
          900: '#090d16',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        // Specular highlights (Linear / Raycast 1px inner bevel)
        'specular': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'specular-strong': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.16)',
        'specular-subtle': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.04)',
        // Surface elevation with inner specular gleam
        'surface-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
        'surface-elevated': '0 12px 36px -4px rgba(0, 0, 0, 0.7), 0 2px 8px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'glass-dock': '0 20px 40px -15px rgba(0, 0, 0, 0.75), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        // Glowing drop shadows
        'glow-brand': '0 0 25px -5px rgba(34, 197, 94, 0.35)',
        'glow-brand-sm': '0 0 15px -3px rgba(34, 197, 94, 0.25)',
        'glow-brand-lg': '0 0 45px -8px rgba(34, 197, 94, 0.45)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.35)',
        'glow-purple': '0 0 25px -5px rgba(168, 85, 247, 0.35)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'fade-out': 'fadeOut 0.2s ease-in forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer': 'shimmer 2.5s infinite linear',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
