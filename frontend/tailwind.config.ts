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
        skin: {
          cream: "#F5EFE6",
          warm: "#E8D5C0",
          charcoal: "#1C1917",
          sage: "#5C7A6B",
          amber: "#C4831A",
          rose: "#B5404A",
          sky: "#3B6EA5",
          muted: "#78716C",
          border: "#D6C9B8",
          surface: "#FFFFFF",
        },
        severity: {
          clear: "#5C7A6B",
          mild: "#3B6EA5",
          moderate: "#C4831A",
          severe: "#B5404A",
        },
        lesion: {
          comedone: "#94A3B8",
          papule: "#3B82F6",
          pustule: "#EAB308",
          nodule: "#EF4444",
        },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', "Georgia", "serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
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
      borderRadius: {
        card: "16px",
        pill: "9999px",
      },
      maxWidth: {
        content: "720px",
        container: "1280px",
      },
      animation: {
        "fade-in": "fadeIn 300ms ease-out forwards",
        "fade-in-up": "fadeInUp 300ms ease-out forwards",
        "slide-in-right": "slideInRight 200ms ease-out forwards",
        "pulse-ring": "pulseRing 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
        "scale-in": "scaleIn 400ms ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(28, 25, 23, 0.06), 0 4px 16px rgba(28, 25, 23, 0.04)",
        "card-hover":
          "0 2px 6px rgba(28, 25, 23, 0.08), 0 8px 24px rgba(28, 25, 23, 0.06)",
        elevated:
          "0 4px 12px rgba(28, 25, 23, 0.08), 0 12px 32px rgba(28, 25, 23, 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
