import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@/components/content/portable-text";
import { ProductCard } from "@/components/content/product-card";
import { NewsletterCta } from "@/components/marketing/newsletter-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { legalDisclaimer, siteConfig } from "@/lib/site-config";
import { formatDate } from "@/lib/utils";
import { getAllArticleParams, getArticleBySlug } from "@/lib/content";

export const revalidate = 3600;

/**
 * Prerenderuj znane artykuły (SSG). Nieznane/nowe slugi renderują się na żądanie
 * (ISR). Gdy Sanity nie jest skonfigurowany → [] i build nadal przechodzi.
 */
export async function generateStaticParams() {
  return getAllArticleParams();
}

const CALCULATOR_LABELS: Record<string, string> = {
  odprawa: "Kalkulator odprawy",
  "ekwiwalent-urlop": "Kalkulator ekwiwalentu za urlop",
  "szkoda-calkowita": "Kalkulator zaniżenia szkody całkowitej",
};

export async function generateMetadata({
  params,
}: {
  params: { pillar: string; slug: string };
}): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return {};
  const title = article.metaTitle ?? article.title;
  const description = article.metaDescription ?? article.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/${params.pillar}/${article.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      images: article.heroImageUrl ? [article.heroImageUrl] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { pillar: string; slug: string };
}) {
  const article = await getArticleBySlug(params.slug);
  if (!article || article.pillarSlug !== params.pillar) notFound();

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    inLanguage: "pl-PL",
    ...(article.authorName
      ? { author: { "@type": "Person", name: article.authorName } }
      : {}),
    ...(article.heroImageUrl ? { image: article.heroImageUrl } : {}),
    publisher: { "@type": "Organization", name: siteConfig.name },
  };

  return (
    <article className="pb-16">
      <JsonLd data={articleLd} />

      <div className="container max-w-3xl py-10">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href={`/${params.pillar}`} className="hover:text-primary">
            {article.pillarTitle ?? "Wróć"}
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl">{article.title}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {article.authorName ? <span>{article.authorName}</span> : null}
          {article.publishedAt ? (
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
          ) : null}
        </div>

        {article.heroImageUrl ? (
          <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted">
            <Image
              src={article.heroImageUrl}
              alt={article.heroAlt ?? article.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        ) : null}

        <p className="mt-6 text-lg text-muted-foreground">{article.excerpt}</p>

        <div className="mt-6">
          <RichText value={article.body} />
        </div>

        {/* Powiązany kalkulator */}
        {article.relatedCalculator &&
        CALCULATOR_LABELS[article.relatedCalculator] ? (
          <div className="mt-10 rounded-lg border border-border bg-primary/5 p-5">
            <h2 className="text-lg font-semibold">Policz to sam</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Skorzystaj z darmowego narzędzia powiązanego z tym tematem.
            </p>
            <Link
              href={`/kalkulatory/${article.relatedCalculator}`}
              className={`mt-3 ${buttonVariants({ variant: "teal", size: "sm" })}`}
            >
              {CALCULATOR_LABELS[article.relatedCalculator]}
            </Link>
          </div>
        ) : null}

        {/* Disclaimer prawny */}
        <p className="mt-10 rounded-md border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
          {legalDisclaimer}
        </p>
      </div>

      {/* Powiązane produkty */}
      {article.relatedProducts.length > 0 ? (
        <section className="container mt-6" aria-labelledby="powiazane-heading">
          <h2 id="powiazane-heading" className="text-2xl">
            Gotowe wzory do tej sprawy
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {article.relatedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="container mt-12 max-w-3xl">
        <NewsletterCta />
      </div>
    </article>
  );
}
