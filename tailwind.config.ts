import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
