"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { mainNav, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/** Aktywna, gdy dokładne trafienie lub trasa zagnieżdżona (np. /kalkulatory/odprawa). */
function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Zamknij menu po zmianie trasy (nawigacja w obrębie SPA).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Zamknij menu klawiszem Escape (dostępność klawiaturowa).
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display text-lg font-bold text-primary"
          aria-current={pathname === "/" ? "page" : undefined}
        >
          {siteConfig.name}
        </Link>

        {/* Nawigacja desktop */}
        <nav
          aria-label="Główna nawigacja"
          className="hidden items-center gap-6 md:flex"
        >
          {mainNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  active ? "text-primary" : "text-foreground/80",
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Przełącznik mobile */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X className="h-6 w-6" aria-hidden />
          ) : (
            <Menu className="h-6 w-6" aria-hidden />
          )}
        </button>
      </div>

      {/* Nawigacja mobile */}
      <nav
        id="mobile-nav"
        aria-label="Nawigacja mobilna"
        className={cn(
          "border-t border-border bg-background md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <ul className="container flex flex-col py-2">
          {mainNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block py-3 text-base font-medium hover:text-primary",
                    active ? "text-primary" : "text-foreground/90",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
