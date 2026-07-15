import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Publikacja treści przez ISR/tagi — brak CDN dla świeżych danych na żądanie.
  useCdn: true,
  perspective: "published",
});
