import { groq } from "next-sanity";

/** Najnowsze artykuły (case studies) na stronę główną. */
export const latestArticlesQuery = groq`
  *[_type == "article" && defined(slug.current)] | order(publishedAt desc)[0...$limit]{
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    "pillar": pillar->{title, "slug": slug.current},
    heroImage
  }
`;

/** Artykuły w danym filarze. */
export const articlesByPillarQuery = groq`
  *[_type == "article" && pillar->slug.current == $pillar] | order(publishedAt desc){
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    heroImage
  }
`;

/** Pojedynczy artykuł wraz z powiązaniami. */
export const articleBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    excerpt,
    body,
    publishedAt,
    updatedAt,
    heroImage,
    "pillar": pillar->{title, "slug": slug.current, color},
    "author": author->{name, bio, avatar},
    relatedCalculator,
    "relatedProducts": relatedProducts[]->{
      _id, title, "slug": slug.current, priceGrosze, shortDescription
    },
    seo
  }
`;

/** Lista produktów w sklepie. */
export const productsQuery = groq`
  *[_type == "product" && defined(slug.current)] | order(_createdAt desc){
    _id, title, "slug": slug.current, priceGrosze, shortDescription, fileFormat,
    "category": category->{title, "slug": slug.current}
  }
`;

/** Pojedynczy produkt (z podglądem fragmentu). */
export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, priceGrosze, shortDescription,
    previewContent, fileFormat, relatedCalculator, storageKey,
    "category": category->{title, "slug": slug.current},
    seo
  }
`;

/** Wyróżnione produkty na stronę główną. */
export const featuredProductsQuery = groq`
  *[_type == "product" && defined(slug.current)] | order(_createdAt desc)[0...$limit]{
    _id, title, "slug": slug.current, priceGrosze, shortDescription
  }
`;

/** Strona prawna po slug. */
export const legalPageQuery = groq`
  *[_type == "legalPage" && slug.current == $slug][0]{
    title, "slug": slug.current, body, updatedAt
  }
`;

/** Ustawienia globalne (singleton). */
export const settingsQuery = groq`
  *[_type == "settings"][0]{
    equivalentCoefficient,
    minimumWageGrosze,
    defaultPartnerCode,
    newsletterPopupCooldownDays,
    consultationDescription,
    consultationPriceGrosze,
    calcomLink
  }
`;

/** Wszystkie slugi do sitemap. */
export const allSlugsForSitemapQuery = groq`{
  "articles": *[_type == "article" && defined(slug.current)]{
    "slug": slug.current, "pillar": pillar->slug.current, updatedAt, publishedAt
  },
  "products": *[_type == "product" && defined(slug.current)]{ "slug": slug.current },
  "legalPages": *[_type == "legalPage" && defined(slug.current)]{ "slug": slug.current, updatedAt }
}`;
