import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        muted: {
          DEFAULT: "var(--background)",
          foreground: "var(--muted)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "#ffffff",
        },
        espresso: {
          DEFAULT: "var(--foreground)",
          muted: "var(--muted)",
        },
        cream: {
          DEFAULT: "var(--background)",
          paper: "var(--card)",
        },
        primary: {
          DEFAULT: "var(--foreground)",
          foreground: "#ffffff",
        },
        status: {
          available: "#047857",
          dnd: "#b91c1c",
          calling: "#c2410c",
          acknowledged: "#1d4ed8",
          offline: "#78716c",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist)", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,25,35,0.025)",
      },
      borderRadius: {
        box: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
