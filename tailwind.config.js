/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nrvPrimaryGreen: '#03442C',
        primary: {
          50: '#f0f9f6',
          100: '#dcf2eb',
          200: '#bce5d7',
          300: '#8dd1bd',
          400: '#56b69e',
          500: '#3a9b82',
          600: '#2f7d69',
          700: '#2a6556',
          800: '#255147',
          900: '#1f423a',
          950: '#0f2a23',
          DEFAULT: '#03442C',
        },
        // Override blue colors with green equivalents based on #03442C
        blue: {
          50: '#f0f9f6',
          100: '#dcf2eb',
          200: '#bce5d7',
          300: '#8dd1bd',
          400: '#56b69e',
          500: '#3a9b82',
          600: '#2f7d69',
          700: '#2a6556',
          800: '#255147',
          900: '#1f423a',
          950: '#0f2a23',
        }
      },
    },
  },
  plugins: [],
}
