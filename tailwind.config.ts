import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8f5",
          100: "#d6eee5",
          200: "#b1ddce",
          300: "#80c4b1",
          400: "#4ea791",
          500: "#2d8b76",
          600: "#1e6f5e",
          700: "#19584c",
          800: "#16473e",
          900: "#143b34",
          950: "#08211d",
        },
        route: {
          50: "#fff8eb",
          100: "#feefc7",
          200: "#fddc8a",
          300: "#fcc44d",
          400: "#faa91b",
          500: "#e98b08",
          600: "#ca6904",
          700: "#a14a06",
          800: "#823a0c",
          900: "#6d300d",
        }
      },
    },
  },
  plugins: [],
};
export default config;
