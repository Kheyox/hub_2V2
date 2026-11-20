/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        brand: 'var(--brand)',
        p1: 'var(--p1)',
        p2: 'var(--p2)',
        border: 'var(--border)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        btn: 'var(--radius-btn)',
      },
    },
  },
  plugins: [],
};
