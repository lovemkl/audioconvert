/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#e8f0fe",
          100: "#c5d8fc",
          500: "#1a73e8",
          600: "#1557b0",
          700: "#0d3f80",
        },
        success: "#2e7d32",
        warning: "#e65100",
        danger:  "#c62828",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
