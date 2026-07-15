import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { formatPln } from "@/lib/utils";
import { getProductBySlug } from "@/lib/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Zamówienie",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <div className="container max-w-xl py-10">
      <h1 className="text-2xl md:text-3xl">Zamówienie</h1>

      <div className="mt-6 flex items-center justify-between rounded-lg border border-border bg-white p-5">
        <div>
          <p className="font-semibold">{product.title}</p>
          <p className="text-sm text-muted-foreground">Wzór dokumentu do pobrania</p>
        </div>
        <span className="font-display text-2xl font-semibold text-primary">
          {formatPln(product.priceGrosze)}
        </span>
      </div>

      <div className="mt-8">
        <CheckoutForm productSlug={product.slug} />
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Obsługujemy BLIK, kartę i szybki przelew (Przelewy24). Po opłaceniu plik
        trafi na Twój e-mail.
      </p>
    </div>
  );
}
