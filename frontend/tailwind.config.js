/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Deep surface layers
        surface: {
          deep:  "#08080f",
          card:  "#0d0d17",
          hover: "#12122a",
          elevated: "#16162a",
        },
        // Legacy navy — kept for compatibility during transition
        navy: {
          950: "#08080f",
          900: "#0d0d17",
          800: "#12122a",
          700: "#16162a",
          600: "#1e1e3a",
          500: "#2a2a4a",
        },
        // Violet brand (primary)
        violet: {
          950: "#0d0520",
          900: "#160d35",
          800: "#2e1065",
          700: "#4c1d95",
          600: "#6d28d9",
          500: "#7c3aed",
          400: "#8b5cf6",
          300: "#a78bfa",
        },
        // Cyan brand (secondary / data)
        cyan: {
          950: "#021b21",
          900: "#042f3e",
          800: "#0c4a6e",
          700: "#0369a1",
          600: "#0891b2",
          500: "#06b6d4",
          400: "#22d3ee",
          300: "#67e8f9",
        },
        // Brand alias (gradient pair)
        brand: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#7c3aed",   // primary violet
          600: "#6d28d9",
          700: "#5b21b6",
          800: "#4c1d95",
          900: "#2e1065",
          // cyan alias
          cyan: "#06b6d4",
        },
        // Risk levels
        risk: {
          low:      "#10b981",
          medium:   "#f59e0b",
          high:     "#f43f5e",
          critical: "#dc2626",
        },
      },
      fontFamily: {
        sans:    ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-brand":    "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
        "gradient-surface":  "linear-gradient(180deg, #0d0d17 0%, #08080f 100%)",
        "gradient-card":     "linear-gradient(135deg, #0d0d17 0%, #12122a 100%)",
        "gradient-sidebar":  "linear-gradient(180deg, #0a0a18 0%, #08080f 100%)",
        "gradient-violet":   "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
        "gradient-cyan":     "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
        "gradient-danger":   "linear-gradient(135deg, #dc2626 0%, #f43f5e 100%)",
        "gradient-success":  "linear-gradient(135deg, #059669 0%, #10b981 100%)",
        "gradient-amber":    "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
      },
      boxShadow: {
        "glow-violet":  "0 0 20px rgba(124, 58, 237, 0.35), 0 4px 24px rgba(0,0,0,0.6)",
        "glow-cyan":    "0 0 20px rgba(6, 182, 212, 0.35), 0 4px 24px rgba(0,0,0,0.6)",
        "glow-green":   "0 0 20px rgba(16, 185, 129, 0.35), 0 4px 24px rgba(0,0,0,0.6)",
        "glow-red":     "0 0 20px rgba(244, 63, 94, 0.35), 0 4px 24px rgba(0,0,0,0.6)",
        "glow-amber":   "0 0 20px rgba(245, 158, 11, 0.35), 0 4px 24px rgba(0,0,0,0.6)",
        "card":         "0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)",
        "card-hover":   "0 8px 40px rgba(0,0,0,0.7), 0 2px 8px rgba(124,58,237,0.15)",
        "inner-glow":   "inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      animation: {
        "glow-pulse":   "glow-pulse 2s ease-in-out infinite",
        "shimmer":      "shimmer 2.2s linear infinite",
        "slide-up":     "slide-up 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in":      "fade-in 0.35s ease both",
        "border-spin":  "border-spin 4s linear infinite",
        "pulse-dot":    "pulse-dot 2s ease-in-out infinite",
        "count-up":     "fade-in 0.5s ease both",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.5" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" },
        },
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "border-spin": {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-dot": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%":       { transform: "scale(1.4)", opacity: "0.6" },
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
