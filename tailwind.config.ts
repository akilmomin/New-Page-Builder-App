import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0078d4",
          hover: "#106ebe",
          light: "#deecf9",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f3f2f1",
          border: "#edebe9",
        },
        text: {
          DEFAULT: "#323130",
          muted: "#605e5c",
          subtle: "#a19f9d",
        },
      },
      boxShadow: {
        card: "0 2px 6px 0 rgba(0,0,0,0.1)",
        "card-hover": "0 4px 12px 0 rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
