/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0D2940", // Navy Blue - Primary
          foreground: "#FDFAFA", // White
        },
        secondary: {
          light: "#7DD3FC", // Light Blue
          DEFAULT: "#3B82F6", // Blue
          dark: "#1A2B41", // Dark Navy
          foreground: "#FDFAFA", // White
        },
        destructive: {
          DEFAULT: "#F04132", // Red
          foreground: "#FDFAFA", // White
        },
        success: {
          DEFAULT: "#10B981", // Green
          foreground: "#FDFAFA", // White
        },
        muted: {
          DEFAULT: "#6B7280", // Gray
          foreground: "#F3F4F6", // Light Gray
        },
        accent: {
          DEFAULT: "#7DD3FC", // Light Blue
          foreground: "#1A1B1C", // Black
        },
        popover: {
          DEFAULT: "#FDFAFA", // White
          foreground: "#1A1B1C", // Black
        },
        card: {
          DEFAULT: "#FDFAFA", // White
          foreground: "#1A1B1C", // Black
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

