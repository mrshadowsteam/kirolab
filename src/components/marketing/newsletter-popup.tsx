"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { NewsletterSignup } from "./newsletter-signup";

const STORAGE_KEY = "smartobywatel_nl_popup_until";
const SHOW_DELAY_MS = 15000;

/** Ścieżki, na których pop-up się nie pokazuje. */
const EXCLUDED_PREFIXES = ["/studio", "/admin", "/pobierz", "/newsletter"];

/**
 * Pop-up newslettera z ograniczeniem częstotliwości (cooldown w localStorage).
 * Pojawia się raz po krótkim opóźnieniu; po zamknięciu/zapisie milknie na
 * `cooldownDays` dni.
 */
export function NewsletterPopup({ cooldownDays }: { cooldownDays: number }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const excluded = EXCLUDED_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix),
  );

  useEffect(() => {
    if (excluded) return;
    let until = 0;
    try {
      until = Number(window.localStorage.getItem(STORAGE_KEY) ?? "0");
    } catch {
      until = 0;
    }
    if (Date.now() < until) return;

    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [excluded, pathname]);

  function snooze() {
    try {
      const until = Date.now() + cooldownDays * 24 * 60 * 60 * 1000;
      window.localStorage.setItem(STORAGE_KEY, String(until));
    } catch {
      // localStorage niedostępny — ignorujemy
    }
  }

  function close() {
    setVisible(false);
    snooze();
  }

  if (!visible || excluded) return null;

  return (
    <div
      role="region"
      aria-labelledby="nl-popup-heading"
      className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-lg border border-border bg-background p-5 shadow-lg"
    >
      <button
        type="button"
        onClick={close}
        aria-label="Zamknij"
        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
      <h2 id="nl-popup-heading" className="pr-6 text-lg font-semibold">
        Darmowy wzór pisma
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Zapisz się do newslettera i odbierz pierwszy wzór dokumentu za darmo.
      </p>
      <NewsletterSignup source="popup" onDone={snooze} />
    </div>
  );
}
