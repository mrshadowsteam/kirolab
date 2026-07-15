"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { mainNav, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display text-lg font-bold text-primary"
          onClick={() => setOpen(false)}
        >
          {siteConfig.name}
        </Link>

        {/* Nawigacja desktop */}
        <nav
          aria-label="Główna nawigacja"
          className="hidden items-center gap-6 md:flex"
        >
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {item.title}
            </Link>
          ))}
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
          {mainNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block py-3 text-base font-medium text-foreground/90 hover:text-primary"
                onClick={() => setOpen(false)}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
