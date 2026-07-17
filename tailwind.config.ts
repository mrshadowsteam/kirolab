import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

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
        // Zieleń sukcesu — green-700. Ciemniejsza od green-600 (#16A34A), aby
        // przechodzić WCAG AA zarówno jako tekst na jasnym tle (~4.8:1), jak i
        // jako biały tekst na wypełnieniu (~5.0:1). #16A34A dawał tylko ~3.2:1.
        success: "#15803D",
        warning: "#B45309",
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        // Kolory filarów (biały tekst na wypełnieniu -> wymóg kontrastu AA).
        // Kariera (indygo) ~6.3:1 i Prawo Pracy (teal) ~5.5:1 przechodzą.
        // Prawa Konsumenta -> orange-700 (#C2410C, ~5.2:1) zamiast amber-600
        // (#D97706), który z białym tekstem dawał tylko ~3.2:1 (poniżej AA).
        pillar: {
          kariera: "#4F46E5",
          "prawo-pracy": "#0F766E",
          "prawa-konsumenta": "#C2410C",
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
  plugins: [tailwindcssAnimate],
};

export default config;
