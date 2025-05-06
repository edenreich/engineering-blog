import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        // Use CSS variables that are defined in globals.css
        primary: 'var(--accent-color)',
        secondary: 'var(--secondary-bg-color)',
        background: 'var(--background-color)',
        'text-color': 'var(--text-color)',
        'heading-color': 'var(--heading-color)',
        'subtitle-color': 'var(--subtitle-color)',
        'date-color': 'var(--date-color)',
        'excerpt-color': 'var(--excerpt-color)',
        'border-color': 'var(--border-color)',
        'tag-bg': 'var(--tag-bg-color)',
        'tag-text': 'var(--tag-text-color)',
        'code-bg': 'var(--code-bg-color)',
        'code-text': 'var(--code-text-color)',
      },
      typography: {
        DEFAULT: {
          css: {
            a: {
              color: 'var(--accent-color)',
              '&:hover': {
                color: 'var(--heading-color)',
              },
            },
            h1: {
              color: 'var(--heading-color)',
              fontWeight: '700',
            },
            h2: {
              color: 'var(--heading-color)',
              fontWeight: '600',
            },
            h3: {
              color: 'var(--heading-color)',
              fontWeight: '600',
            },
            code: {
              color: 'var(--code-text-color)',
              backgroundColor: 'var(--code-bg-color)',
              padding: '0.2em 0.4em',
              borderRadius: '0.25em',
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
};
export default config;
