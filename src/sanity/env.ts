/**
 * Konfiguracja środowiska Sanity.
 * Wartości pochodzą ze zmiennych środowiskowych (patrz .env.example).
 * Świadomie NIE rzucamy wyjątku przy braku wartości, aby build (np. w CI z
 * placeholderami) nie padał — realne wartości ustawiane są w Vercel.
 */
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";

/** true, gdy skonfigurowano realny projekt Sanity. */
export const isSanityConfigured = projectId !== "placeholder";
