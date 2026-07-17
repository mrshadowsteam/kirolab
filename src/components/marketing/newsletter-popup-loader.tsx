"use client";

import dynamic from "next/dynamic";

/**
 * Dynamiczny (code-split) loader pop-upu newslettera. Kod pop-upu (formularz,
 * ikony, logika localStorage) NIE trafia do współdzielonego bundle'a layoutu —
 * ładuje się dopiero po stronie klienta (wym. 9.4, design §10 „pop-up jako
 * komponent ładowany dynamicznie").
 *
 * `ssr: false` jest właściwe, bo pop-up jest widgetem wyłącznie klienckim:
 * pokazuje się z opóźnieniem i zależy od `localStorage`, więc nie ma sensu
 * renderować go po stronie serwera. `ssr: false` można ustawić tylko w
 * komponencie klienckim, dlatego layout (Server Component) renderuje ten
 * cienki wrapper zamiast bezpośredniego `next/dynamic`.
 *
 * Brak `loading` placeholdera jest zamierzony — pop-up i tak pojawia się dopiero
 * po opóźnieniu i jest nieblokującą kartką w rogu, więc nic nie renderujemy w
 * trakcie ładowania (zero wpływu na LCP/CLS strony).
 */
const NewsletterPopup = dynamic(
  () => import("./newsletter-popup").then((m) => m.NewsletterPopup),
  { ssr: false },
);

export function NewsletterPopupLoader({
  cooldownDays,
}: {
  cooldownDays: number;
}) {
  return <NewsletterPopup cooldownDays={cooldownDays} />;
}
