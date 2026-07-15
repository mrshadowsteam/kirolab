import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@/components/content/portable-text";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { legalDisclaimer } from "@/lib/site-config";
import { formatPln } from "@/lib/utils";
import { getProductBySlug } from "@/lib/content";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.metaTitle ?? product.title,
    description: product.metaDescription ?? product.shortDescription,
    alternates: { canonical: `/sklep/${product.slug}` },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription,
    offers: {
      "@type": "Offer",
      price: (product.priceGrosze / 100).toFixed(2),
      priceCurrency: "PLN",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="container max-w-3xl py-10">
      <JsonLd data={productLd} />

      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/sklep" className="hover:text-primary">
          Sklep
        </Link>
      </nav>

      <h1 className="text-3xl md:text-4xl">{product.title}</h1>
      <p className="mt-3 text-muted-foreground">{product.shortDescription}</p>

      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-white p-5">
        <span className="font-display text-3xl font-semibold text-primary">
          {formatPln(product.priceGrosze)}
        </span>
        {product.fileFormat ? (
          <span className="text-sm text-muted-foreground">
            Format: {product.fileFormat.toUpperCase()}
          </span>
        ) : null}
        <Link
          href={`/sklep/${product.slug}/zamowienie`}
          className={`ml-auto ${buttonVariants({ variant: "primary", size: "lg" })}`}
        >
          Kup i pobierz
        </Link>
      </div>

      {/* Podgląd fragmentu treści przed zakupem */}
      <section className="mt-10" aria-labelledby="podglad-heading">
        <h2 id="podglad-heading" className="text-2xl">
          Podgląd fragmentu
        </h2>
        <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/20 p-5">
          <RichText value={product.previewContent} />
        </div>
      </section>

      <p className="mt-10 rounded-md border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        {legalDisclaimer}
      </p>
    </div>
  );
}
