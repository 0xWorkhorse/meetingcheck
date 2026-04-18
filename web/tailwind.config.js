/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper:     '#f2ece0',
        'paper-2': '#eee5d2',
        ink:       '#0b0b0b',
        'ink-2':   '#1a1a1a',
        muted:     '#6b6558',
        rule:      '#0b0b0b',
        danger:    '#d6311a',
        safe:      '#1c7a3d',
        warn:      '#b58900',
        highlight: '#f5d547',
      },
      fontFamily: {
        mono:      ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'],
        display:   ['"Space Grotesk"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        serif:     ['"Instrument Serif"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
