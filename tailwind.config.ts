import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"]
      },
      colors: {
        background: "#06131d",
        foreground: "#edf6fb",
        border: "rgba(255,255,255,0.12)",
        card: "rgba(8, 24, 37, 0.72)",
        primary: {
          DEFAULT: "#59f3c2",
          foreground: "#062119"
        },
        danger: {
          DEFAULT: "#ff5f6d",
          foreground: "#fff4f4"
        },
        warning: {
          DEFAULT: "#ffbe5c",
          foreground: "#2f1900"
        },
        muted: {
          DEFAULT: "rgba(227,239,247,0.18)",
          foreground: "rgba(227,239,247,0.7)"
        }
      },
      boxShadow: {
        glow: "0 0 60px rgba(89, 243, 194, 0.18)",
        danger: "0 0 40px rgba(255, 95, 109, 0.22)"
      },
      backgroundImage: {
        grid:
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
