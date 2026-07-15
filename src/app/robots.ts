import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/studio",
        "/api",
        "/pobierz",
        "/pobierz-wzor",
        "/newsletter/potwierdz",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
