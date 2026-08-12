import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: "#E26620", // botones principales, CTAs
        blue: "#7AB3E4", // acentos — sampled directly from logooptima.png's blue stroke
        yellow: "#FFE734", // review cards
        green: "#BCD133", // review cards
        cream: "#FDF5F0", // background general
        dark: "#1a1a1a", // textos
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
