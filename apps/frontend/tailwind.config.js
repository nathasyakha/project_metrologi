/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0a1628",
          900: "#0f1f38",
          800: "#16294a",
          700: "#1f3a63",
        },
        brass: {
          400: "#d4a94a",
          500: "#c2933a",
          600: "#a67a2d",
        },
        ink: "#101418",
      },
      fontFamily: {
        sans: ["Public Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
