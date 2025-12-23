import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        moss: {
          50: "#f4f8f2",
          100: "#e4efe0",
          200: "#c7dec1",
          300: "#a8c99f",
          400: "#7fae74",
          500: "#5b8f53",
          600: "#47713f",
          700: "#385832",
          800: "#2d4729",
          900: "#273d24"
        },
        clay: {
          50: "#fbf5f1",
          100: "#f6e8dd",
          200: "#ecd1bd",
          300: "#e0b395",
          400: "#d2906d",
          500: "#c5764e",
          600: "#a55c3a",
          700: "#84492f",
          800: "#6c3c29",
          900: "#5a3325"
        }
      },
      boxShadow: {
        soft: "0 16px 40px rgba(45, 71, 41, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
