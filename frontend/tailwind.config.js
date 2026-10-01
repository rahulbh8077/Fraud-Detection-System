/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#08080a", // Deep Charcoal Black
          900: "#0f0f12", // Rich Charcoal Base
          800: "#16161b", // Charcoal Surface Card
          700: "#1e1e24", // Subtle Charcoal Hover
          600: "#2a2a34", // Charcoal Border
          500: "#363644", // Active Charcoal Border
        },
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        risk: {
          low: "#10b981",
          medium: "#f59e0b",
          high: "#ef4444",
          critical: "#dc2626",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-navy": "linear-gradient(135deg, #09090b 0%, #121216 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
