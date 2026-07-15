import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Lista dozwolonych adresów właściciela (ADMIN_EMAILS, rozdzielone przecinkami). */
function allowedAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Zwraca zalogowanego właściciela panelu lub null.
 * Zabezpieczenie dwuwarstwowe: (1) ważna sesja Supabase, (2) e-mail na allow-liście.
 * Fail-closed: gdy ADMIN_EMAILS nie jest skonfigurowane, dostęp jest zablokowany —
 * dzięki temu nawet przy włączonej publicznej rejestracji w Supabase nikt postronny
 * nie wejdzie do panelu.
 */
export async function getAdminUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const allow = allowedAdminEmails();
  if (allow.length === 0) {
    console.error(
      "ADMIN_EMAILS nie skonfigurowane — dostęp do panelu /admin zablokowany.",
    );
    return null;
  }

  const email = user.email?.toLowerCase();
  if (!email || !allow.includes(email)) return null;

  return user;
}
