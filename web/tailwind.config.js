/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper:     'rgb(var(--paper) / <alpha-value>)',
        'paper-2': 'rgb(var(--paper-2) / <alpha-value>)',
        ink:       'rgb(var(--ink) / <alpha-value>)',
        'ink-2':   'rgb(var(--ink-2) / <alpha-value>)',
        muted:     'rgb(var(--muted) / <alpha-value>)',
        rule:      'rgb(var(--ink) / <alpha-value>)',
        danger:    'rgb(var(--danger) / <alpha-value>)',
        safe:      'rgb(var(--safe) / <alpha-value>)',
        warn:      'rgb(var(--warn) / <alpha-value>)',
        highlight: 'rgb(var(--highlight) / <alpha-value>)',
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
