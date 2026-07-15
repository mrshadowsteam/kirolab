import type { Metadata } from "next";
import { ProductCard } from "@/components/content/product-card";
import { NewsletterCta } from "@/components/marketing/newsletter-cta";
import { getAllProducts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Sklep — Zbrojownia Konsumenta",
  description:
    "Gotowe wzory pism i dokumentów do samodzielnego wypełnienia: odwołania, reklamacje, pisma do pracodawcy i ubezpieczyciela.",
  alternates: { canonical: "/sklep" },
};

export const revalidate = 3600;

export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <div className="container py-12">
      <h1 className="text-3xl md:text-4xl">Zbrojownia Konsumenta</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Gotowe wzory pism do samodzielnego wypełnienia. Po zakupie otrzymasz plik
        na e-mail — bez zakładania konta.
      </p>

      {products.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-muted-foreground">
          Wzory pojawią się tu wkrótce. Zapisz się do newslettera, aby dostać
          pierwszy wzór za darmo.
        </p>
      )}

      <div className="mt-12">
        <NewsletterCta />
      </div>
    </div>
  );
}
