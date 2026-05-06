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
        bg: {
          base:    'var(--bg-base)',
          surface: 'var(--bg-surface)',
          subtle:  'var(--bg-subtle)',
          muted:   'var(--bg-muted)',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary:  'var(--text-tertiary)',
          inverse:   'var(--text-inverse)',
        },
        brand: {
          DEFAULT: 'var(--brand-primary)',
          hover:   'var(--brand-hover)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          light:   'var(--accent-light)',
          dark:    'var(--accent-dark)',
        },
        border: {
          default: 'var(--border-default)',
          strong:  'var(--border-strong)',
          focus:   'var(--border-focus)',
        },
        severity: {
          clear:    'var(--severity-clear)',
          mild:     'var(--severity-mild)',
          moderate: 'var(--severity-mod)',
          severe:   'var(--severity-severe)',
        },
        lesion: {
          comedone: 'var(--lesion-comedone)',
          papule:   'var(--lesion-papule)',
          pustule:  'var(--lesion-pustule)',
          nodule:   'var(--lesion-nodule)',
        },
      },
      fontFamily: {
        display: ['DM Serif Display', 'Georgia', 'serif'],
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease forwards',
      },
    },
  },
  plugins: [],
};
export default config;
