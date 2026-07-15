import Image from "next/image";
import Link from "next/link";
import { PillarBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { PillarSlug } from "@/lib/site-config";
import type { ArticleCardData } from "@/lib/content-types";

const KNOWN_PILLARS: PillarSlug[] = [
  "kariera",
  "prawo-pracy",
  "prawa-konsumenta",
];

function isPillarSlug(value: string | null): value is PillarSlug {
  return value !== null && (KNOWN_PILLARS as string[]).includes(value);
}

export function ArticleCard({ article }: { article: ArticleCardData }) {
  const href =
    article.pillarSlug && article.slug
      ? `/${article.pillarSlug}/${article.slug}`
      : "#";

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-white">
      <Link href={href} className="flex flex-1 flex-col">
        {article.heroImageUrl ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
            <Image
              src={article.heroImageUrl}
              alt={article.heroAlt ?? article.title}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col gap-2 p-5">
          <div className="flex items-center gap-2">
            {isPillarSlug(article.pillarSlug) && article.pillarTitle ? (
              <PillarBadge
                pillar={article.pillarSlug}
                label={article.pillarTitle}
              />
            ) : null}
            {article.publishedAt ? (
              <time
                dateTime={article.publishedAt}
                className="text-xs text-muted-foreground"
              >
                {formatDate(article.publishedAt)}
              </time>
            ) : null}
          </div>
          <h3 className="text-lg font-semibold group-hover:text-primary">
            {article.title}
          </h3>
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {article.excerpt}
          </p>
        </div>
      </Link>
    </article>
  );
}
