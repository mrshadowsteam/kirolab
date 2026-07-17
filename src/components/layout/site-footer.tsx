import Link from "next/link";
import { NewsletterSignup } from "@/components/marketing/newsletter-signup";
import {
  legalDisclaimer,
  legalNav,
  mainNav,
  siteConfig,
} from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border bg-muted/40">
      <div className="container grid gap-8 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold text-primary">
            {siteConfig.name}
          </p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            {siteConfig.tagline}
          </p>
        </div>

        <nav aria-label="Sekcje serwisu">
          <h2 className="text-sm font-semibold">Serwis</h2>
          <ul className="mt-3 space-y-2">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Informacje prawne">
          <h2 className="text-sm font-semibold">Informacje prawne</h2>
          <ul className="mt-3 space-y-2">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Zapis do newslettera — dostępny ze stopki na każdej stronie (wym. 7.1) */}
      <section
        aria-labelledby="footer-newsletter-heading"
        className="border-t border-border"
      >
        <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <h2
              id="footer-newsletter-heading"
              className="font-display text-lg font-bold text-primary"
            >
              Newsletter Smart Obywatel
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Zapisz się i odbierz darmowy wzór pisma. Konkretne porady, zero
              spamu — zgodę możesz wycofać w każdej chwili.
            </p>
          </div>
          <div className="w-full max-w-sm">
            <NewsletterSignup source="footer" />
          </div>
        </div>
      </section>

      {/* Disclaimer widoczny na każdej stronie */}
      <div className="border-t border-border">
        <div className="container py-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {legalDisclaimer}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            © {year} {siteConfig.name}. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  );
}
