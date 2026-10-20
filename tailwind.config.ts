import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B0D",
        brand: { DEFAULT: "#DF2029", dark: "#B9161E" },
        mist: "#F5F5F5",
      },
      fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"] },
      maxWidth: { site: "1200px" },
      keyframes: {
        rise: { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "none" } },
        fadein: { "0%": { opacity: "0", transform: "translateX(24px) scale(1.02)" }, "100%": { opacity: "1", transform: "none" } },
      },
      animation: { rise: "rise .7s cubic-bezier(.2,.7,.2,1) both", fadein: "fadein 1.1s cubic-bezier(.2,.7,.2,1) both" },
    },
  },
  plugins: [],
} satisfies Config;
