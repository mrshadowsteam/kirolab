import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArticleCard } from "@/components/content/article-card";
import { ProductCard } from "@/components/content/product-card";
import { NewsletterCta } from "@/components/marketing/newsletter-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { pillars, siteConfig } from "@/lib/site-config";
import { getFeaturedProducts, getLatestArticles } from "@/lib/content";

// ISR — odśwież treść co godzinę / po webhooku rewalidacji z Sanity.
export const revalidate = 3600;

export default async function HomePage() {
  const [articles, products] = await Promise.all([
    getLatestArticles(6),
    getFeaturedProducts(3),
  ]);

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "pl-PL",
  };

  return (
    <>
      <JsonLd data={organizationLd} />
      <JsonLd data={websiteLd} />

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

      {/* Najnowsze case studies */}
      {articles.length > 0 ? (
        <section className="container py-8" aria-labelledby="case-studies-heading">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="case-studies-heading" className="text-2xl md:text-3xl">
              Najnowsze case studies
            </h2>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Wyróżnione produkty */}
      {products.length > 0 ? (
        <section className="container py-8" aria-labelledby="produkty-heading">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="produkty-heading" className="text-2xl md:text-3xl">
              Gotowe wzory pism
            </h2>
            <Link
              href="/sklep"
              className="text-sm font-medium text-amber-strong hover:underline"
            >
              Cały sklep →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Newsletter */}
      <section className="container py-16">
        <NewsletterCta />
      </section>
    </>
  );
}
