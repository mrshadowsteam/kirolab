import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { urlForImage } from "@/sanity/lib/image";
import type { PortableTextValue } from "@/lib/content-types";

/**
 * Wymiary obrazu zakodowane są w referencji assetu Sanity
 * (`image-<id>-<szer>x<wys>-<format>`). Odczytujemy je, aby przekazać
 * `width`/`height` do `next/image` — dzięki temu przeglądarka rezerwuje miejsce
 * i unikamy przesunięć układu (CLS, wym. 9.1/9.3).
 */
function imageDimensions(
  value: unknown,
): { width: number; height: number } | null {
  const ref =
    value && typeof value === "object" && "asset" in value
      ? (value as { asset?: { _ref?: unknown } }).asset?._ref
      : undefined;
  if (typeof ref !== "string") return null;
  const match = /-(\d+)x(\d+)-/.exec(ref);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
  if (width <= 0 || height <= 0) return null;
  return { width, height };
}

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      let url: string | null = null;
      try {
        url = urlForImage(value as unknown as SanityImageSource)
          .width(1200)
          .url();
      } catch {
        url = null;
      }
      if (!url) return null;
      const alt =
        value && typeof value === "object" && "alt" in value
          ? String((value as { alt?: unknown }).alt ?? "")
          : "";
      const dims = imageDimensions(value);
      // Obraz z Sanity (cdn.sanity.io skonfigurowany w next.config) — `next/image`
      // dostarcza responsywny srcset + AVIF/WebP i leniwe ładowanie domyślnie
      // (wym. 9.3, 9.4). `sizes` = szerokość kolumny treści (max-w-3xl ≈ 768px).
      if (dims) {
        return (
          <Image
            src={url}
            alt={alt}
            width={dims.width}
            height={dims.height}
            sizes="(max-width: 768px) 100vw, 768px"
            className="my-6 h-auto w-full rounded-md"
          />
        );
      }
      // Fallback dla nietypowej referencji bez wymiarów: nadal leniwe ładowanie.
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          loading="lazy"
          className="my-6 h-auto w-full rounded-md"
        />
      );
    },
  },
  marks: {
    link: ({ value, children }) => {
      const href =
        value && typeof value === "object" && "href" in value
          ? String((value as { href?: unknown }).href ?? "#")
          : "#";
      const isExternal = href.startsWith("http");
      if (isExternal) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        );
      }
      return <Link href={href}>{children}</Link>;
    },
  },
  block: {
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-primary pl-4 italic text-muted-foreground">
        {children}
      </blockquote>
    ),
  },
};

/** Renderuje treść Portable Text (artykuły, strony prawne). */
export function RichText({ value }: { value: PortableTextValue }) {
  return (
    <div className="content-prose">
      <PortableText value={value} components={components} />
    </div>
  );
}
