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
        paper: {
          light: '#fcfbf7',
          dark: '#1e1f24',
          border: '#e5e4e7',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'notion': 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px, rgba(0, 0, 0, 0.05) 0px 1px 4px 0px',
        'notion-lg': 'rgba(0, 0, 0, 0.08) 0px 4px 12px 0px',
        'editorial': '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 4px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow-indigo': '0 0 25px -5px rgba(99, 102, 241, 0.5)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.5)',
      }
    },
  },
  plugins: [],
}
