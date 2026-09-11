import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          DEFAULT: "#00ff88",
          dark: "#00cc66",
          light: "#00ffaa",
        },
        night: {
          900: "#0a0a0a",
          800: "#0f0f0f",
          700: "#1a1a1a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
