import createImageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";
import { dataset, projectId } from "@/sanity/env";

const builder = createImageUrlBuilder({ projectId, dataset });

/** Buduje URL obrazu z Sanity (z transformacjami). */
export function urlForImage(source: Image) {
  return builder.image(source).auto("format").fit("max");
}
