import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#b91c1c",
        'primary-dark': "#991b1b",
        'primary-light': "#dc2626",
        secondary: "#374151",
        'secondary-dark': "#1f2937",
        'secondary-light': "#4b5563",
        accent: "#fbbf24",
        'accent-dark': "#f59e0b",
        'accent-light': "#fcd34d",
        light: "#f9fafb",
        dark: "#111827",
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui'],
        serif: ['var(--font-serif)', 'Georgia'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      spacing: {
        '128': '32rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            color: theme('colors.secondary'),
            a: {
              color: theme('colors.primary'),
              '&:hover': {
                color: theme('colors.primary-dark'),
              },
            },
            h1: {
              color: theme('colors.secondary-dark'),
            },
            h2: {
              color: theme('colors.secondary-dark'),
            },
            h3: {
              color: theme('colors.secondary-dark'),
            },
            h4: {
              color: theme('colors.secondary-dark'),
            },
            blockquote: {
              color: theme('colors.secondary-light'),
            },
            strong: {
              color: theme('colors.secondary-dark'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate')
  ],
  darkMode: ["class"],
};
export default config;