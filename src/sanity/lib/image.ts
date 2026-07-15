import createImageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { dataset, projectId } from "@/sanity/env";

const builder = createImageUrlBuilder({ projectId, dataset });

/** Buduje URL obrazu z Sanity (z transformacjami). */
export function urlForImage(source: SanityImageSource) {
  return builder.image(source).auto("format").fit("max");
}
