import type { Config } from "tailwindcss";

/**
 * System wizualny Smart Obywatel.
 * Paleta i reguła kontrastu bursztynu — patrz design.md §8.
 * - Bursztyn (accent) używany JAKO WYPEŁNIENIE z ciemnym tekstem (accent-foreground).
 * - Bursztynowy TEKST/LINK na jasnym tle -> używać `amber-strong` (#B45309, WCAG AA).
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        // Tło i tekst
        background: "#FBFAF7",
        foreground: "#1F2937",
        muted: {
          DEFAULT: "#F1EFEA",
          foreground: "#6B7280",
        },
        border: "#E5E1D8",
        // Primary — teal (zaufanie)
        primary: {
          DEFAULT: "#0F766E",
          foreground: "#FFFFFF",
        },
        // Accent — bursztyn (CTA); tekst na wierzchu musi być ciemny
        accent: {
          DEFAULT: "#F59E0B",
          foreground: "#1F2937",
        },
        // Bursztyn dla tekstu/linków na jasnym tle (WCAG AA)
        "amber-strong": "#B45309",
        success: "#16A34A",
        warning: "#B45309",
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        // Kolory filarów
        pillar: {
          kariera: "#4F46E5",
          "prawo-pracy": "#0F766E",
          "prawa-konsumenta": "#D97706",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
};

export default config;
