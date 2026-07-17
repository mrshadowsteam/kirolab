"use client";

import { useEffect, useMemo } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

/**
 * Osadzenie (inline embed) kalendarza rezerwacji Cal.com Cloud — zgodnie z
 * design.md §2, §5.4, §7 („/konsultacje oferta + embed Cal.com") oraz §14 decyzja 5
 * (Cal.com Cloud + Stripe). Płatność (Stripe) pobierana jest PRZED rezerwacją po
 * stronie Cal.com — kod tylko osadza link do wydarzenia; aplikacja Stripe i
 * płatność „z góry" konfigurowane są w panelu typu wydarzenia Cal.com.
 *
 * Komponent jest wyspą klienta ładowaną dynamicznie (ssr:false) — jego JS oraz
 * skrypt embeda Cal.com nie blokują LCP strony (design §10).
 */

interface CalcomEmbedProps {
  /** Pełny link Cal.com, np. `https://cal.com/uzytkownik/konsultacja`. */
  calcomLink: string;
}

/** Rozbija pełny URL Cal.com na `calLink` (ścieżka wydarzenia) i `calOrigin` (host). */
function parseCalcomLink(
  url: string,
): { calLink: string; calOrigin: string } | null {
  try {
    const parsed = new URL(url);
    const calLink = parsed.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
    if (!calLink) return null;
    return { calLink, calOrigin: parsed.origin };
  } catch {
    return null;
  }
}

export function CalcomEmbed({ calcomLink }: CalcomEmbedProps) {
  const parsed = useMemo(() => parseCalcomLink(calcomLink), [calcomLink]);

  useEffect(() => {
    if (!parsed) return;
    let active = true;
    void (async () => {
      try {
        const cal = await getCalApi();
        if (!active) return;
        // Spójny wygląd z systemem wizualnym (teal jako kolor marki, design §8).
        cal("ui", {
          theme: "light",
          hideEventTypeDetails: false,
          layout: "month_view",
          cssVarsPerTheme: {
            light: { "cal-brand": "#0F766E" },
            dark: { "cal-brand": "#0F766E" },
          },
        });
      } catch {
        // Konfiguracja UI jest opcjonalna — brak sieci/Cal.com nie może wywrócić strony.
      }
    })();
    return () => {
      active = false;
    };
  }, [parsed]);

  // Nieprawidłowy URL w ustawieniach → pokaż awaryjny odnośnik zamiast pustego embeda.
  if (!parsed) {
    return (
      <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Nie udało się załadować kalendarza rezerwacji.{" "}
        <a
          href={calcomLink}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-amber-strong underline"
        >
          Otwórz stronę rezerwacji w nowej karcie
        </a>
        .
      </div>
    );
  }

  return (
    <div>
      <Cal
        calLink={parsed.calLink}
        calOrigin={parsed.calOrigin}
        config={{ layout: "month_view", theme: "light" }}
        className="h-[70vh] min-h-[600px] w-full overflow-auto rounded-md border border-border"
        role="region"
        aria-label="Kalendarz rezerwacji konsultacji (Cal.com)"
      />
      <p className="mt-3 text-sm text-muted-foreground">
        Kalendarz się nie ładuje?{" "}
        <a
          href={calcomLink}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-amber-strong underline"
        >
          Otwórz rezerwację w nowej karcie
        </a>
        .
      </p>
    </div>
  );
}
