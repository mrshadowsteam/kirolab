import "server-only";
import type { QueryParams } from "next-sanity";
import { client } from "@/sanity/lib/client";

/**
 * Pomocnik do pobierania danych z Sanity z tagami rewalidacji ISR.
 * Rewalidacja wyzwalana webhookiem Sanity -> /api/revalidate (tag-based).
 */
export async function sanityFetch<QueryResponse>({
  query,
  params = {},
  tags = [],
  revalidate = 3600,
}: {
  query: string;
  params?: QueryParams;
  tags?: string[];
  revalidate?: number | false;
}): Promise<QueryResponse> {
  return client.fetch<QueryResponse>(query, params, {
    next: {
      revalidate: tags.length ? false : revalidate,
      tags,
    },
  });
}
