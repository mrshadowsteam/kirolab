"use client";

import dynamic from "next/dynamic";

/**
 * Dynamiczna (code-split) wersja embeda Cal.com. JS embeda nie trafia do
 * początkowego bundle'a strony konsultacji — ładuje się po stronie klienta
 * dopiero po hydracji (`ssr: false`), więc nie obciąża LCP (design §10, §5.4).
 * Wzorzec analogiczny do `components/calculators/dynamic.tsx`.
 */
export const CalcomEmbed = dynamic(
  () => import("./calcom-embed").then((m) => m.CalcomEmbed),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[70vh] min-h-[600px] w-full items-center justify-center rounded-md border border-border bg-muted/40 text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        Ładowanie kalendarza rezerwacji…
      </div>
    ),
  },
);
