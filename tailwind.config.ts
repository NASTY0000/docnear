import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        tide: {
          50: "#f0fafa",
          100: "#d5f1f0",
          200: "#aae2e0",
          300: "#72ccc9",
          400: "#3eaeab",
          500: "#24918f",
          600: "#1b7473",
          700: "#195d5d",
          800: "#184b4c",
          900: "#0f3334",
          950: "#071c1d",
        },
        coral: {
          50: "#fff4f1",
          100: "#ffe6df",
          200: "#ffc9bb",
          400: "#f07167",
          500: "#e24b3f",
          600: "#c83328",
          700: "#a62820",
          800: "#89251f",
        },
        sand: {
          50: "#fbfaf6",
          100: "#f4f0e6",
          200: "#e8dfcc",
          300: "#d4c6a8",
        },
        ink: {
          50: "#f4f6f7",
          700: "#3a4650",
          900: "#152028",
          950: "#0b1218",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        lift: "0 1px 2px rgba(15, 51, 52, 0.06), 0 10px 28px rgba(15, 51, 52, 0.08)",
        "lift-dark": "0 1px 2px rgba(0,0,0,0.45), 0 12px 32px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
