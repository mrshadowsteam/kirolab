import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Dev: bez CDN (natychmiastowy podgląd świeżej treści).
  // Produkcja: CDN (szybkość); świeżość zapewnia ISR + rewalidacja tagów po webhooku.
  useCdn: process.env.NODE_ENV === "production",
  perspective: "published",
});
