import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        app: "#F8FAFC",
        surface: "#FFFFFF",
        "brand-blue": {
          DEFAULT: "#1D4ED8",
          hover: "#1E40AF",
          dark: "#1E3A8A",
          light: "#EFF6FF",
          50: "#EFF6FF",
          500: "#1D4ED8",
          600: "#1E40AF",
          800: "#1E3A8A",
        },
        "brand-gold": {
          DEFAULT: "#D97706",
          light: "#FEF3C7",
          dark: "#92400E",
        },
        main: "#1F2937",
        muted: "#6B7280",
        subtle: "#E5E7EB",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
