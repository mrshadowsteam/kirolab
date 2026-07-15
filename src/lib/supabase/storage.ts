import "server-only";
import { createAdminClient } from "./admin";

/** Prywatne buckety Storage. */
export const STORAGE_BUCKETS = {
  /** Płatne wzory pism (dostęp tylko po zakupie, przez token). */
  products: "products",
  /** Darmowy lead magnet (dostęp po potwierdzeniu newslettera). */
  leadMagnets: "lead-magnets",
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

/**
 * Tworzy krótkotrwały, podpisany URL do pobrania pliku z prywatnego bucketa.
 * Wywoływane dopiero PO walidacji tokenu (sklep) lub potwierdzeniu (lead magnet).
 */
export async function createSignedDownloadUrl(
  bucket: StorageBucket,
  storageKey: string,
  expiresInSeconds = 300,
): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storageKey, expiresInSeconds, { download: true });

  if (error || !data?.signedUrl) {
    throw new Error(
      `Nie udało się utworzyć linku pobrania: ${error?.message ?? "brak danych"}`,
    );
  }

  return data.signedUrl;
}
