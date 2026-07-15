import Script from "next/script";

/**
 * Plausible Analytics (privacy-first, hosting EU, bez cookies).
 * Renderuje się tylko jeśli ustawiono NEXT_PUBLIC_PLAUSIBLE_DOMAIN.
 */
export function PlausibleAnalytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const src =
    process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "https://plausible.io/js/script.js";

  if (!domain) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src={src}
      strategy="afterInteractive"
    />
  );
}
