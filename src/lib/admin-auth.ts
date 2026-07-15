import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Zwraca zalogowanego użytkownika (właściciela) lub null. */
export async function getAdminUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
