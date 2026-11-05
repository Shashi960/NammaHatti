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
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#0f766e", // Deep Forest Teal / Pine
          600: "#115e59",
          700: "#134e4a",
          800: "#134e4a",
          900: "#042f2e",
          950: "#021c1b",
        },
        route: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#ea580c", // Transit Amber / Orange
          600: "#c2410c",
          700: "#9a3412",
          800: "#7c2d12",
          900: "#431407",
        },
        coral: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#e11d48", // Vibrant Coral / Rose for Buy Now
          600: "#be123c",
          700: "#9f1239",
        },
        ui: {
          primary: "#0f766e", // Header & brand
          primaryDark: "#115e59",
          primaryLight: "#f0fdfa",
          accent: "#e11d48", // Buy Now & urgent alerts
          secondary: "#ea580c", // Commuter route
          amber: "#f59e0b",
          green: "#059669",
          dark: "#0f172a",
          gray: "#64748b",
          lightGray: "#f8fafc",
          border: "#e2e8f0",
        }
      },
    },
  },
  plugins: [],
};
export default config;
