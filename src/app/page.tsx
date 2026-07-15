import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { pillars } from "@/lib/site-config";

/**
 * Strona główna — wersja Fazy 0 (fundament + prezentacja systemu wizualnego).
 * Pełna strona główna z case studies i wyróżnionymi produktami: zadanie 12 (Faza 4).
 */
export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
        <div className="container flex flex-col items-start gap-6 py-16 md:py-24">
          <h1 className="max-w-3xl text-4xl leading-tight md:text-5xl">
            Konkretna pomoc, gdy zawodzi biurokracja.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Artykuły, darmowe kalkulatory i gotowe wzory pism z zakresu prawa
            pracy, praw konsumenta i kariery. Rozwiąż swoją sprawę krok po kroku.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/kalkulatory"
              className={buttonVariants({ variant: "primary", size: "lg" })}
            >
              Wypróbuj kalkulatory
            </Link>
            <Link
              href="/sklep"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Zobacz wzory pism
            </Link>
          </div>
        </div>
      </section>

      {/* Trzy filary */}
      <section className="container py-16" aria-labelledby="filary-heading">
        <h2 id="filary-heading" className="text-2xl md:text-3xl">
          Trzy obszary, w których pomagamy
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <Link
              key={pillar.slug}
              href={`/${pillar.slug}`}
              className="group rounded-lg border border-border bg-white p-6 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span
                className={`mb-4 inline-block h-1.5 w-12 rounded-full ${pillar.colorClass}`}
                aria-hidden
              />
              <h3 className="text-xl group-hover:text-primary">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {pillar.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
