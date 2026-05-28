/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        silver: {
          50: '#f8f8f8',
          100: '#e8e8e8',
          200: '#d4d4d4',
          300: '#b8b8b8',
          400: '#a0a0a0',
          500: '#C0C0C0',
          600: '#909090',
          700: '#707070',
          800: '#505050',
          900: '#383838',
        },
        qilin: {
          blue: '#007ACC',
          dark: '#005a9e',
          light: '#3399cc',
        },
      },
    },
  },
  plugins: [],
}
