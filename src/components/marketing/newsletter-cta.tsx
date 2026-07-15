import { Mail } from "lucide-react";
import { NewsletterSignup } from "./newsletter-signup";

/** Blok CTA newslettera z funkcjonalnym zapisem (double opt-in) i lead magnetem. */
export function NewsletterCta({ source = "newsletter-cta" }: { source?: string }) {
  return (
    <section
      aria-labelledby="newsletter-heading"
      className="rounded-lg border border-border bg-primary/5 p-6 md:p-8"
    >
      <div className="flex items-start gap-4">
        <span
          className="hidden rounded-md bg-primary p-3 text-primary-foreground sm:inline-flex"
          aria-hidden
        >
          <Mail className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <h2 id="newsletter-heading" className="text-xl md:text-2xl">
            Odbierz darmowy wzór pisma
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Zapisz się do newslettera Smart Obywatel i dostań pierwszy gotowy
            wzór dokumentu za darmo. Konkretne porady, zero spamu.
          </p>
          <div className="max-w-md">
            <NewsletterSignup source={source} />
          </div>
        </div>
      </div>
    </section>
  );
}
