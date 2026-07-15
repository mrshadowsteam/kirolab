import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Klient Supabase po stronie serwera (uwierzytelnianie oparte na cookie).
 * Używany w panelu /admin (Faza 8). Zapis cookie działa tylko w Route Handlers /
 * Server Actions — w RSC zapis jest ignorowany (stąd try/catch).
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Wywołane z RSC — bezpiecznie ignorujemy (odświeżanie sesji przez middleware).
          }
        },
      },
    },
  );
}
