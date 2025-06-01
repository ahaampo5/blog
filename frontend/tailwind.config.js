/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}", // .css 포함
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#333',
            a: {
              color: '#3b82f6',
              '&:hover': {
                color: '#1d4ed8',
              },
            },
            'h1, h2, h3, h4': {
              color: '#111827',
            },
            pre: {
              backgroundColor: '#f3f4f6',
            },
            code: {
              backgroundColor: '#f3f4f6',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
