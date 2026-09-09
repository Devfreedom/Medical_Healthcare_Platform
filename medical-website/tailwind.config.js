export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        nb: {
          ink: '#132A2C',
          teal: '#0F3D3E',
          'teal-dark': '#0A2B2C',
          sage: '#6B8F7A',
          sand: '#F2EFE6',
          paper: '#FBFAF6',
          clay: '#B85C38',
          'clay-dark': '#9A492C',
          line: '#DCD6C6',
        },
        pastel: {
          tan: '#F3E4C8',
          'tan-ink': '#8A6A2F',
          pink: '#F6DEE3',
          'pink-ink': '#A24C63',
          blue: '#DCEAF3',
          'blue-ink': '#3E6E8E',
          green: '#DEEBE1',
          'green-ink': '#3E7A57',
        },
      },
      fontFamily: {
        serif: ['"Source Serif Pro"', 'Georgia', 'serif'],
        sans: ['-apple-system', 'Segoe UI', 'Inter', 'Helvetica', 'sans-serif'],
      },
      maxWidth: { content: '1280px' },
    },
  },
};
