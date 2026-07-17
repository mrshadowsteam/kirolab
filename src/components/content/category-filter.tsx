"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { pillars, type PillarSlug } from "@/lib/site-config";

/** Tło aktywnego filtra — spójne z kolorami filarów (PillarBadge, design.md §8). */
const pillarActiveBg: Record<PillarSlug, string> = {
  kariera: "bg-pillar-kariera",
  "prawo-pracy": "bg-pillar-prawo-pracy",
  "prawa-konsumenta": "bg-pillar-prawa-konsumenta",
};

/**
 * Filtr kategorii dla listy artykułów (wym. 2.7).
 *
 * Zgodnie z requirements.md (2.2 i 2.7) „kategoria" === „filar", a artykuł ma
 * wyłącznie referencję do filaru (brak dodatkowych tagów/podkategorii). Filtr
 * przełącza więc między trzema filarami. Realizacja po stronie klienta: nawigacja
 * między statycznie generowanymi stronami filarów (`/[pillar]`) — nie łamie SSG/ISR.
 *
 * Dostępność: `<nav>` z etykietą, linki natywnie obsługiwane klawiaturą, widoczny
 * focus ring, `aria-current="page"` dla aktywnej kategorii, cel dotykowy ≥ 44 px.
 */
export function CategoryFilter() {
  const pathname = usePathname();

  return (
    <nav aria-label="Filtruj artykuły według kategorii" className="mb-8">
      <ul className="flex flex-wrap gap-2">
        {pillars.map((pillar) => {
          const isActive = pathname === `/${pillar.slug}`;
          return (
            <li key={pillar.slug}>
              <Link
                href={`/${pillar.slug}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isActive
                    ? cn(pillarActiveBg[pillar.slug], "text-white")
                    : "border border-border bg-white text-foreground hover:bg-muted",
                )}
              >
                {pillar.shortTitle}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
