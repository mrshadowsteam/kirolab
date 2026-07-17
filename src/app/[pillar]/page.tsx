import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/content/article-card";
import { CategoryFilter } from "@/components/content/category-filter";
import { NewsletterCta } from "@/components/marketing/newsletter-cta";
import { pillars } from "@/lib/site-config";
import { getArticlesByPillar } from "@/lib/content";

export const revalidate = 3600;

/** Prerenderuj 3 znane filary; nieznane slugi -> 404. */
export function generateStaticParams() {
  return pillars.map((p) => ({ pillar: p.slug }));
}

function findPillar(slug: string) {
  return pillars.find((p) => p.slug === slug);
}

export function generateMetadata({
  params,
}: {
  params: { pillar: string };
}): Metadata {
  const pillar = findPillar(params.pillar);
  if (!pillar) return {};
  return {
    title: pillar.title,
    description: pillar.description,
    alternates: { canonical: `/${pillar.slug}` },
  };
}

export default async function PillarPage({
  params,
}: {
  params: { pillar: string };
}) {
  const pillar = findPillar(params.pillar);
  if (!pillar) notFound();

  const articles = await getArticlesByPillar(pillar.slug);

  return (
    <>
      <section className="border-b border-border bg-muted/30">
        <div className="container py-12 md:py-16">
          <span
            className={`mb-4 inline-block h-1.5 w-12 rounded-full ${pillar.colorClass}`}
            aria-hidden
          />
          <h1 className="text-3xl md:text-4xl">{pillar.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            {pillar.description}
          </p>
        </div>
      </section>

      <section className="container py-12">
        <h2 className="sr-only">Artykuły w kategorii {pillar.title}</h2>
        <CategoryFilter />

        {articles.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Wkrótce pojawią się tu artykuły. Zapisz się do newslettera, aby nic
            nie przegapić.
          </p>
        )}

        <div className="mt-12">
          <NewsletterCta />
        </div>
      </section>
    </>
  );
}
