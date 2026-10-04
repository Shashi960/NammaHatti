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
          500: "#2874f0", // Flipkart primary blue
          600: "#1a5dc7",
          700: "#14489b",
          800: "#113876",
          900: "#0e2c5c",
          950: "#081a38",
        },
        route: {
          50: "#fff8eb",
          100: "#feefc7",
          200: "#fddc8a",
          300: "#fcc44d",
          400: "#faa91b",
          500: "#ff9f00", // Flipkart amber/yellow
          600: "#fb641b", // Flipkart orange
          700: "#d94b07",
          800: "#ab3709",
          900: "#8a2d0b",
        },
        fk: {
          blue: "#2874f0",
          blueDark: "#1a5dc7",
          blueLight: "#f1f5fe",
          orange: "#fb641b",
          yellow: "#ff9f00",
          green: "#388e3c",
          dark: "#212121",
          gray: "#878787",
          lightGray: "#f1f2f4",
          border: "#e0e0e0",
        }
      },
    },
  },
  plugins: [],
};
export default config;
