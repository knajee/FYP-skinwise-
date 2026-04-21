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
        canvas: "#0A0A0F",
        "surface-1": "#0F1117",
        "surface-2": "#13151F",
        "surface-3": "rgba(45,212,191,0.04)",
        accent: {
          DEFAULT: "#2DD4BF",
          hover: "#5EEAD4",
          muted: "rgba(45,212,191,0.08)",
        },
        severity: {
          clear: "#10B981",
          mild: "#F59E0B",
          moderate: "#F97316",
          severe: "#F43F5E",
        },
        lesion: {
          comedone: "#CBD5E1",
          papule: "#FBBF24",
          pustule: "#F97316",
          nodule: "#F43F5E",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-dm-serif)", "Georgia", "serif"],
      },
      fontSize: {
        micro: ["11px", { lineHeight: "16px" }],
        "xs-body": ["13px", { lineHeight: "20px" }],
        body: ["15px", { lineHeight: "24px" }],
        emphasis: ["18px", { lineHeight: "28px" }],
        "card-header": ["24px", { lineHeight: "32px" }],
        section: ["32px", { lineHeight: "40px" }],
        hero: ["48px", { lineHeight: "56px" }],
        "hero-lg": ["64px", { lineHeight: "72px" }],
      },
      maxWidth: {
        content: "720px",
        container: "1280px",
      },
      animation: {
        "fade-in": "fadeIn 250ms ease-out forwards",
        "fade-in-up": "fadeInUp 300ms ease-out forwards",
        "slide-in-right": "slideInRight 200ms ease-out forwards",
        "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
        "scale-in": "scaleIn 400ms ease-out forwards",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
      boxShadow: {
        card: "0 0 0 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4)",
        "card-hover":
          "0 0 0 1px rgba(255,255,255,0.08), 0 12px 40px rgba(0,0,0,0.5)",
        "glow-teal": "0 0 24px rgba(45,212,191,0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
