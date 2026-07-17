import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/fulfillment";
import { createSignedDownloadUrl, STORAGE_BUCKETS } from "@/lib/supabase/storage";

// Trasa jest zawsze dynamiczna i nigdy nie cache'owana: odpowiedź to przekierowanie
// do krótkotrwałego (300 s) signed URL, więc buforowanie przez przeglądarkę/CDN
// mogłoby serwować już wygasły link. Nagłówek no-store temu zapobiega.
export const dynamic = "force-dynamic";

const NO_STORE = "no-store, max-age=0, must-revalidate";

function noStore<T extends NextResponse>(res: T): T {
  res.headers.set("Cache-Control", NO_STORE);
  return res;
}

/**
 * Pobranie darmowego lead magnetu: link ważny 30 dni, BEZ limitu pobrań.
 * Świadomie oddzielone od logiki tokenów sklepowych. Odpowiedzi nie są cache'owane.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } },
) {
  const record = await prisma.leadMagnetToken.findUnique({
    where: { tokenHash: hashToken(params.token) },
  });

  if (!record) {
    return noStore(new NextResponse("Nieprawidłowy link.", { status: 404 }));
  }
  if (record.expiresAt.getTime() < Date.now()) {
    return noStore(
      new NextResponse("Link wygasł (był ważny 30 dni).", { status: 410 }),
    );
  }

  const signedUrl = await createSignedDownloadUrl(
    STORAGE_BUCKETS.leadMagnets,
    record.storageKey,
    300,
  );
  return noStore(NextResponse.redirect(signedUrl));
}

/**
 * HEAD: odpowiadamy bez efektów ubocznych (bez zapytań do bazy i bez tworzenia
 * signed URL). Podglądy linków w klientach poczty i skanery nie powinny generować
 * niepotrzebnych, krótkotrwałych URL-i do prywatnego pliku.
 */
export async function HEAD() {
  return noStore(new NextResponse(null, { status: 200 }));
}
