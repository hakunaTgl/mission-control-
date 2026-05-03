import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0b0f",
        panel: "#15151d",
        accent: "#ff3b3b",
        neon: "#7dffb3"
      }
    }
  },
  plugins: []
};

export default config;
