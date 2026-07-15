import type { ComponentProps } from "react";
import type { PortableText } from "@portabletext/react";

/** Typ wartości Portable Text, wyprowadzony bezpośrednio z komponentu. */
export type PortableTextValue = ComponentProps<typeof PortableText>["value"];

/** Karta artykułu (lista, strona główna). */
export interface ArticleCardData {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  pillarTitle: string | null;
  pillarSlug: string | null;
  heroImageUrl: string | null;
  heroAlt: string | null;
}

/** Karta produktu (sklep, powiązane produkty). */
export interface ProductCardData {
  _id: string;
  title: string;
  slug: string;
  priceGrosze: number;
  shortDescription: string;
}

/** Pełny artykuł. */
export interface ArticleData {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: PortableTextValue;
  publishedAt: string;
  updatedAt: string | null;
  heroImageUrl: string | null;
  heroAlt: string | null;
  pillarTitle: string | null;
  pillarSlug: string | null;
  authorName: string | null;
  relatedCalculator: string | null;
  relatedProducts: ProductCardData[];
  metaTitle: string | null;
  metaDescription: string | null;
}

/** Pełny produkt (strona sklepu). */
export interface ProductData {
  _id: string;
  title: string;
  slug: string;
  priceGrosze: number;
  shortDescription: string;
  previewContent: PortableTextValue;
  fileFormat: string | null;
  /** Klucz pliku w Storage — używany wyłącznie po stronie serwera. */
  storageKey: string | null;
  relatedCalculator: string | null;
  categoryTitle: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

/** Ustawienia globalne (singleton). */
export interface SettingsData {
  equivalentCoefficient: number | null;
  minimumWageGrosze: number | null;
  defaultPartnerCode: string | null;
  newsletterPopupCooldownDays: number | null;
  consultationDescription: PortableTextValue | null;
  consultationPriceGrosze: number | null;
  calcomLink: string | null;
}
