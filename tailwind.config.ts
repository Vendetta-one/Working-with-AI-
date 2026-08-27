import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        warmwhite: '#FBF7F0',
        cream: '#F3EDE3',
        paleblue: {
          DEFAULT: '#DCE7F0',
          100: '#E2EBF3',
          200: '#DCE7F0',
          700: '#3B6FA0',
        },
        sage: {
          DEFAULT: '#A7C4A0',
          100: '#E4EEE2',
          500: '#8FB389',
          600: '#6E9B6A',
          700: '#557D52',
        },
        ink: '#27313A',
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(59, 111, 160, 0.25)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
};

export default config;
