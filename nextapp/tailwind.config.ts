import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'primary': {
          light: '#f87171', // red-400
          DEFAULT: '#dc2626', // red-600 
          dark: '#b91c1c', // red-700
        },
        'secondary': {
          light: '#fecaca', // red-200
          DEFAULT: '#fca5a5', // red-300
          dark: '#f87171', // red-400
        },
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            h2: {
              color: theme('colors.primary.DEFAULT'),
              fontWeight: '600',
            },
            h3: {
              color: theme('colors.primary.DEFAULT'),
              fontWeight: '600',
            },
            h4: {
              color: theme('colors.primary.DEFAULT'),
              fontWeight: '600',
            },
            a: {
              color: theme('colors.primary.DEFAULT'),
              textDecoration: 'underline',
              '&:hover': {
                color: theme('colors.primary.dark'),
              },
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;