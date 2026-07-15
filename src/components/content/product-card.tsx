import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { formatPln } from "@/lib/utils";
import type { ProductCardData } from "@/lib/content-types";

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <article className="flex flex-col justify-between rounded-lg border border-border bg-white p-5">
      <div>
        <h3 className="text-lg font-semibold">{product.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
          {product.shortDescription}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="font-display text-lg font-semibold text-primary">
          {formatPln(product.priceGrosze)}
        </span>
        <Link
          href={`/sklep/${product.slug}`}
          className={buttonVariants({ variant: "primary", size: "sm" })}
        >
          Zobacz wzór
        </Link>
      </div>
    </article>
  );
}
