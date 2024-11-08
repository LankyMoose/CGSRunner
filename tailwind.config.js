import { transform } from "typescript"

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        info: "#3f2993",
        success: "#267d46",
        warning: "#a46319",
        danger: "#963030",
      },
    },
  },
  plugins: [],
}
