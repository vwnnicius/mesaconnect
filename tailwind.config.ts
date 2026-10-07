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
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        muted: {
          DEFAULT: "#f0e7dc",
          foreground: "var(--muted)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "#fff7ed",
        },
        espresso: {
          DEFAULT: "#1f1814",
          muted: "#3d3229",
        },
        cream: {
          DEFAULT: "#f3ece3",
          paper: "#faf6f1",
        },
        primary: {
          DEFAULT: "#1f1814",
          foreground: "#faf6f1",
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
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(31,24,20,0.04), 0 8px 24px -16px rgba(31,24,20,0.18)",
      },
      borderRadius: {
        box: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
