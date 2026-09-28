import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#111111",
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F7F7F7",
          hover: "#F3F3F3",
          border: "#E3E3E3",
          borderStrong: "#D5D5D5",
        },
        text: {
          primary: "#111111",
          secondary: "#5F6368",
          muted: "#767676",
        },
        amazon: {
          orange: "#FF9900",
          orangeDark: "#E47911",
          orangeLight: "#FFF7E6",
          orangeSoft: "#FFF3E0",
          orangeBorder: "#F5C26B",
          orangeBorderSoft: "#F5C27A",
          navy: "#131921",
          navyLight: "#232F3E",
          teal: "#007185",
          tealDark: "#004B57",
        },
        status: {
          success: "#067D62",
          warning: "#B54708",
          danger: "#C40000",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        dropdown: "0 4px 12px 0 rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
} satisfies Config;
