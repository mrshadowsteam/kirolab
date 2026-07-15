"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Klient Supabase po stronie przeglądarki (anon key).
 * Wykorzystywany m.in. przy logowaniu do panelu leadów (Faza 8).
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
