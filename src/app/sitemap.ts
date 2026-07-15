import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getSitemapData } from "@/lib/content";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const staticPaths = [
    "",
    "/kariera",
    "/prawo-pracy",
    "/prawa-konsumenta",
    "/kalkulatory",
    "/kalkulatory/odprawa",
    "/kalkulatory/ekwiwalent-urlop",
    "/kalkulatory/szkoda-calkowita",
    "/sklep",
    "/konsultacje",
    "/ekspert",
    "/polityka-prywatnosci",
    "/regulamin-sklepu",
    "/regulamin-konsultacji",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
  }));

  const data = await getSitemapData();

  const articleEntries: MetadataRoute.Sitemap = data.articles
    .filter((a) => a.pillar && a.slug)
    .map((a) => ({
      url: `${base}/${a.pillar}/${a.slug}`,
      lastModified: a.updatedAt
        ? new Date(a.updatedAt)
        : a.publishedAt
          ? new Date(a.publishedAt)
          : now,
    }));

  const productEntries: MetadataRoute.Sitemap = data.products.map((p) => ({
    url: `${base}/sklep/${p.slug}`,
    lastModified: now,
  }));

  return [...staticEntries, ...articleEntries, ...productEntries];
}
