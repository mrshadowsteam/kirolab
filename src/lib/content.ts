import "server-only";
import { cache } from "react";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { urlForImage } from "@/sanity/lib/image";
import { isSanityConfigured } from "@/sanity/env";
import {
  allSlugsForSitemapQuery,
  articleBySlugQuery,
  articleParamsQuery,
  articlesByPillarQuery,
  featuredProductsQuery,
  latestArticlesQuery,
  legalPageQuery,
  productByCalculatorQuery,
  productBySlugQuery,
  productParamsQuery,
  productsQuery,
  settingsQuery,
} from "@/sanity/lib/queries";
import type {
  ArticleCardData,
  ArticleData,
  LegalPageData,
  ProductCardData,
  ProductData,
  SettingsData,
  SitemapData,
} from "@/lib/content-types";

/**
 * Odporne pobieranie z Sanity: gdy CMS nie jest skonfigurowany (build w CI) lub
 * wystąpi błąd — zwraca wartość zapasową zamiast wywracać build/stronę.
 */
async function safeFetch<T>(
  query: string,
  params: Record<string, unknown>,
  tags: string[],
  fallback: T,
): Promise<T> {
  if (!isSanityConfigured) return fallback;
  try {
    return await sanityFetch<T>({ query, params, tags });
  } catch (error) {
    console.error("Błąd pobierania z Sanity:", error);
    return fallback;
  }
}

function imageUrl(source: unknown, width: number): string | null {
  if (!source) return null;
  try {
    return urlForImage(source as SanityImageSource)
      .width(width)
      .url();
  } catch {
    return null;
  }
}

function altOf(source: unknown): string | null {
  if (source && typeof source === "object" && "alt" in source) {
    const alt = (source as { alt?: unknown }).alt;
    return typeof alt === "string" ? alt : null;
  }
  return null;
}

// --- Typy surowych odpowiedzi GROQ ---

interface RawPillarRef {
  title?: string;
  slug?: string;
}

interface RawArticleCard {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  pillar?: RawPillarRef | null;
  heroImage?: unknown;
}

interface RawProductCard {
  _id: string;
  title: string;
  slug: string;
  priceGrosze: number;
  shortDescription: string;
}

interface RawArticle extends RawArticleCard {
  body: unknown;
  updatedAt?: string | null;
  author?: { name?: string } | null;
  relatedCalculator?: string | null;
  relatedProducts?: RawProductCard[] | null;
  seo?: { metaTitle?: string | null; metaDescription?: string | null } | null;
}

// --- Mapowanie ---

function toArticleCard(a: RawArticleCard): ArticleCardData {
  return {
    _id: a._id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    publishedAt: a.publishedAt,
    pillarTitle: a.pillar?.title ?? null,
    pillarSlug: a.pillar?.slug ?? null,
    heroImageUrl: imageUrl(a.heroImage, 800),
    heroAlt: altOf(a.heroImage),
  };
}

function toProductCard(p: RawProductCard): ProductCardData {
  return {
    _id: p._id,
    title: p.title,
    slug: p.slug,
    priceGrosze: p.priceGrosze,
    shortDescription: p.shortDescription,
  };
}

// --- Publiczne loadery ---

export async function getLatestArticles(limit = 6): Promise<ArticleCardData[]> {
  const raw = await safeFetch<RawArticleCard[]>(
    latestArticlesQuery,
    { limit },
    ["article"],
    [],
  );
  return raw.map(toArticleCard);
}

export async function getArticlesByPillar(
  pillar: string,
): Promise<ArticleCardData[]> {
  const raw = await safeFetch<RawArticleCard[]>(
    articlesByPillarQuery,
    { pillar },
    ["article"],
    [],
  );
  return raw.map(toArticleCard);
}

export async function getFeaturedProducts(
  limit = 3,
): Promise<ProductCardData[]> {
  const raw = await safeFetch<RawProductCard[]>(
    featuredProductsQuery,
    { limit },
    ["product"],
    [],
  );
  return raw.map(toProductCard);
}

export async function getAllProducts(): Promise<ProductCardData[]> {
  const raw = await safeFetch<RawProductCard[]>(productsQuery, {}, ["product"], []);
  return raw.map(toProductCard);
}

/**
 * Slugi wszystkich produktów do prerenderu SSG (generateStaticParams).
 * Gdy Sanity nie jest skonfigurowany, zwraca [] — build przechodzi, a strony
 * produktów renderują się na żądanie (ISR, `dynamicParams` domyślnie true).
 */
export async function getAllProductParams(): Promise<{ slug: string }[]> {
  const raw = await safeFetch<{ slug: string | null }[]>(
    productParamsQuery,
    {},
    ["product"],
    [],
  );
  return raw
    .filter((r): r is { slug: string } => Boolean(r.slug))
    .map((r) => ({ slug: r.slug }));
}

/**
 * Wzór pisma powiązany z danym kalkulatorem (pole `relatedCalculator` w CMS).
 * Zwraca `null`, gdy CMS nie jest skonfigurowany lub autor nie przypisał produktu
 * — wtedy kalkulator linkuje do ogólnego katalogu sklepu jako fallback.
 */
export async function getProductForCalculator(
  calculator: string,
): Promise<ProductCardData | null> {
  const raw = await safeFetch<RawProductCard | null>(
    productByCalculatorQuery,
    { calculator },
    ["product"],
    null,
  );
  return raw ? toProductCard(raw) : null;
}

interface RawProduct extends RawProductCard {
  previewContent?: unknown;
  fileFormat?: string | null;
  storageKey?: string | null;
  relatedCalculator?: string | null;
  category?: { title?: string } | null;
  seo?: { metaTitle?: string | null; metaDescription?: string | null } | null;
}

export const getProductBySlug = cache(
  async (slug: string): Promise<ProductData | null> => {
    const raw = await safeFetch<RawProduct | null>(
      productBySlugQuery,
      { slug },
      ["product"],
      null,
    );
    if (!raw) return null;

    return {
      _id: raw._id,
      title: raw.title,
      slug: raw.slug,
      priceGrosze: raw.priceGrosze,
      shortDescription: raw.shortDescription,
      previewContent: (raw.previewContent ?? []) as unknown as ProductData["previewContent"],
      fileFormat: raw.fileFormat ?? null,
      storageKey: raw.storageKey ?? null,
      relatedCalculator: raw.relatedCalculator ?? null,
      categoryTitle: raw.category?.title ?? null,
      metaTitle: raw.seo?.metaTitle ?? null,
      metaDescription: raw.seo?.metaDescription ?? null,
    };
  },
);

/** Pełny artykuł po slug (cache dla deduplikacji metadata + strona). */
export const getArticleBySlug = cache(
  async (slug: string): Promise<ArticleData | null> => {
    const raw = await safeFetch<RawArticle | null>(
      articleBySlugQuery,
      { slug },
      ["article"],
      null,
    );
    if (!raw) return null;

    return {
      _id: raw._id,
      title: raw.title,
      slug: raw.slug,
      excerpt: raw.excerpt,
      body: (raw.body ?? []) as unknown as ArticleData["body"],
      publishedAt: raw.publishedAt,
      updatedAt: raw.updatedAt ?? null,
      heroImageUrl: imageUrl(raw.heroImage, 1200),
      heroAlt: altOf(raw.heroImage),
      pillarTitle: raw.pillar?.title ?? null,
      pillarSlug: raw.pillar?.slug ?? null,
      authorName: raw.author?.name ?? null,
      relatedCalculator: raw.relatedCalculator ?? null,
      relatedProducts: (raw.relatedProducts ?? []).map(toProductCard),
      metaTitle: raw.seo?.metaTitle ?? null,
      metaDescription: raw.seo?.metaDescription ?? null,
    };
  },
);

/**
 * Parametry (filar + slug) wszystkich artykułów do prerenderu SSG.
 * Gdy Sanity nie jest skonfigurowany, zwraca [] — build zbuduje się, a strony
 * artykułów renderują się na żądanie (ISR, `dynamicParams` domyślnie true).
 */
export async function getAllArticleParams(): Promise<
  { pillar: string; slug: string }[]
> {
  const raw = await safeFetch<{ pillar: string | null; slug: string | null }[]>(
    articleParamsQuery,
    {},
    ["article"],
    [],
  );
  return raw
    .filter(
      (r): r is { pillar: string; slug: string } => Boolean(r.pillar && r.slug),
    )
    .map((r) => ({ pillar: r.pillar, slug: r.slug }));
}

export async function getSettings(): Promise<SettingsData | null> {
  return safeFetch<SettingsData | null>(settingsQuery, {}, ["settings"], null);
}

interface RawLegalPage {
  title: string;
  body?: unknown;
  updatedAt?: string | null;
}

export const getLegalPage = cache(
  async (slug: string): Promise<LegalPageData | null> => {
    const raw = await safeFetch<RawLegalPage | null>(
      legalPageQuery,
      { slug },
      ["legalPage"],
      null,
    );
    if (!raw) return null;
    return {
      title: raw.title,
      body: (raw.body ?? []) as unknown as LegalPageData["body"],
      updatedAt: raw.updatedAt ?? null,
    };
  },
);

export async function getSitemapData(): Promise<SitemapData> {
  return safeFetch<SitemapData>(
    allSlugsForSitemapQuery,
    {},
    ["article", "product", "legalPage"],
    { articles: [], products: [], legalPages: [] },
  );
}
