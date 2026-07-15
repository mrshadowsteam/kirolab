import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Klient Supabase z rolą serwisową (service role) — pełny dostęp, TYLKO serwer.
 * Używany do operacji na Storage (signed URL) i zadań administracyjnych.
 * NIGDY nie eksponować klucza service role po stronie klienta.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Brak konfiguracji Supabase (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
