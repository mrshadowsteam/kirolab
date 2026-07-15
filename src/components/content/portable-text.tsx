import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import Link from "next/link";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { urlForImage } from "@/sanity/lib/image";
import type { PortableTextValue } from "@/lib/content-types";

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
