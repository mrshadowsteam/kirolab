import Script from "next/script";

/**
 * Plausible Analytics (Plausible Cloud, hosting w UE) — komponent skryptu
 * przełączany zmienną środowiskową.
 *
 * Zgodność (Wymaganie 11.2, design §14.3):
 * - privacy-first i **bez cookies** — nie wymaga rozbudowanego banera zgód RODO;
 * - dane zbierane przez Plausible Cloud są hostowane w UE (endpoint `plausible.io`);
 * - nie profiluje użytkowników ani nie zbiera danych osobowych.
 *
 * Przełącznik env:
 * - renderuje skrypt **tylko** gdy ustawiono `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
 *   (np. `smartobywatel.pl`); w innym wypadku jest no-opem (nic nie ładuje) —
 *   dzięki temu analityka nie działa np. w developmencie bez konfiguracji.
 * - `NEXT_PUBLIC_PLAUSIBLE_SRC` pozwala wskazać własny endpoint (self-host lub
 *   proxy); domyślnie używany jest oficjalny skrypt Plausible Cloud (UE).
 */
export function PlausibleAnalytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();
  const src =
    process.env.NEXT_PUBLIC_PLAUSIBLE_SRC?.trim() ||
    "https://plausible.io/js/script.js";

  // Przełącznik env: bez skonfigurowanej domeny nic nie ładujemy.
  if (!domain) return null;

  return (
    <Script
      id="plausible-analytics"
      data-domain={domain}
      src={src}
      strategy="afterInteractive"
    />
  );
}
