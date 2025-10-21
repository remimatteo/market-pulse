import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Professional dark theme colors (no gradients)
        background: '#0a0e1a',
        'background-light': '#131824',
        surface: '#1a1f2e',
        'surface-light': '#252b3d',
        'surface-border': '#2d3548',
        primary: '#3b82f6',
        'primary-light': '#60a5fa',
        'primary-dark': '#2563eb',
        bullish: '#10b981',
        'bullish-light': '#34d399',
        bearish: '#ef4444',
        'bearish-light': '#f87171',
        neutral: '#f59e0b',
        'neutral-light': '#fbbf24',
      },
    },
  },
  plugins: [],
}
export default config
