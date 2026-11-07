import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Emerald
    'bg-emerald-500', 'border-emerald-500', 'text-emerald-500', 'ring-emerald-500', 'bg-emerald-500/10', 'bg-emerald-500/20', 'border-emerald-500/30',
    // Blue
    'bg-blue-500', 'border-blue-500', 'text-blue-500', 'ring-blue-500', 'bg-blue-500/10', 'bg-blue-500/20', 'border-blue-500/30',
    // Purple
    'bg-purple-500', 'border-purple-500', 'text-purple-500', 'ring-purple-500', 'bg-purple-500/10', 'bg-purple-500/20', 'border-purple-500/30',
    // Pink
    'bg-pink-500', 'border-pink-500', 'text-pink-500', 'ring-pink-500', 'bg-pink-500/10', 'bg-pink-500/20', 'border-pink-500/30',
    // Amber
    'bg-amber-500', 'border-amber-500', 'text-amber-500', 'ring-amber-500', 'bg-amber-500/10', 'bg-amber-500/20', 'border-amber-500/30',
    // Red
    'bg-red-500', 'border-red-500', 'text-red-500', 'ring-red-500', 'bg-red-500/10', 'bg-red-500/20', 'border-red-500/30',
    // Cyan
    'bg-cyan-500', 'border-cyan-500', 'text-cyan-500', 'ring-cyan-500', 'bg-cyan-500/10', 'bg-cyan-500/20', 'border-cyan-500/30',
    // Lime
    'bg-lime-500', 'border-lime-500', 'text-lime-500', 'ring-lime-500', 'bg-lime-500/10', 'bg-lime-500/20', 'border-lime-500/30',
    // Orange
    'bg-orange-500', 'border-orange-500', 'text-orange-500', 'ring-orange-500', 'bg-orange-500/10', 'bg-orange-500/20', 'border-orange-500/30',
    // Green
    'bg-green-500', 'border-green-500', 'text-green-500', 'ring-green-500', 'bg-green-500/10', 'bg-green-500/20', 'border-green-500/30',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#10B981',    // Emerald Liderzy Jutra
          primaryDark: '#059669',
          primaryLight: '#34D399',
          secondary: '#06B6D4',  // Cyan akcent
          surface: '#0F172A',    // Dark Slate
          surfaceCard: '#1E293B',
          surfaceHover: '#334155',
          border: '#334155',
          muted: '#94A3B8',
        },
        chameleon: {
          emerald: '#10B981',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          pink: '#EC4899',
          amber: '#F59E0B',
          red: '#EF4444',
          cyan: '#06B6D4',
          lime: '#84CC16',
        },
      },
      boxShadow: {
        'neon-emerald': '0 0 15px rgba(16, 185, 129, 0.45)',
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.45)',
        'neon-purple': '0 0 15px rgba(139, 92, 246, 0.45)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
