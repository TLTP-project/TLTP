import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/routes/**/*.{html,js,ts,svelte}",
    "./src/lib/**/*.{html,js,ts,svelte}",
    "./src/features/**/*.{html,js,ts,svelte}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background, #fffaf5)",
        foreground: "var(--foreground, #2d2522)",
        brand: {
          50: "#fff8f1",
          100: "#feeedc",
          200: "#fcdab8",
          300: "#f9bc86",
          400: "#f59451",
          500: "#f0742a",
          600: "#e1581e",
          700: "#ba4219",
          800: "#94361b",
          900: "#782e19",
        },
      },
    },
  },
  plugins: [],
};

export default config;
