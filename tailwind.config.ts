import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kyndly: {
          dark: "#0F3D44",
          teal: "#4FBFB3",
          "teal-light": "#7BD1C5",
          "teal-muted": "#A8C5C0",
          red: "#B85042",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
