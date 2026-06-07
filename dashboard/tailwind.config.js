/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Montserrat", ...defaultTheme.fontFamily.sans],
      mono: defaultTheme.fontFamily.mono,
    },
    extend: {
      colors: {
        brand: {
          50: "#e6f2f8",
          100: "#cce5f1",
          200: "#99cbe3",
          300: "#66b1d5",
          400: "#3397c7",
          500: "#085c8a",
          600: "#064a6e",
          700: "#053852",
          800: "#042638",
          900: "#02141c",
          DEFAULT: "#085c8a",
        },
      },
    },
  },
  plugins: [],
}