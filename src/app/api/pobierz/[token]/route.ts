import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/fulfillment";
import { createSignedDownloadUrl, STORAGE_BUCKETS } from "@/lib/supabase/storage";
import { siteConfig } from "@/lib/site-config";

// Trasa jest zawsze dynamiczna i nigdy nie cache'owana: odpowiedź to jednorazowe
// przekierowanie do krótkotrwałego signed URL, a każde wywołanie zmienia licznik
// pobrań. Nagłówek no-store zapobiega buforowaniu przez przeglądarkę/CDN.
export const dynamic = "force-dynamic";

const NO_STORE = "no-store, max-age=0, must-revalidate";

function noStore<T extends NextResponse>(res: T): T {
  res.headers.set("Cache-Control", NO_STORE);
  return res;
}

/**
 * Serwuje plik po walidacji tokenu: sprawdza ważność (72h) i limit pobrań (3),
 * tworzy krótkotrwały signed URL, a dopiero potem — atomowo i warunkowo —
 * zwiększa licznik i przekierowuje. Przy wygaśnięciu/limicie odsyła na stronę
 * statusu (z opcją „wyślij ponownie"). Odpowiedzi nie są cache'owane.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } },
) {
  const statusUrl = `${siteConfig.url}/pobierz/${params.token}`;
  const record = await prisma.downloadToken.findUnique({
    where: { tokenHash: hashToken(params.token) },
    include: { order: true },
  });

  if (!record) {
    return noStore(NextResponse.redirect(statusUrl));
  }

  const expired = record.expiresAt.getTime() < Date.now();
  const limitReached = record.downloadCount >= record.maxDownloads;
  if (expired || limitReached) {
    return noStore(NextResponse.redirect(statusUrl));
  }

  if (!record.order.productStorageKey) {
    return noStore(
      new NextResponse("Plik jest niedostępny — skontaktuj się z nami.", {
        status: 500,
      }),
    );
  }

  // Najpierw tworzymy signed URL. Jeśli Storage zwróci błąd, wyjątek przerwie
  // obsługę PRZED zmianą licznika — użytkownik nie traci pobrania i może spróbować
  // ponownie (odwrotna kolejność spalałaby pobranie bez wydania pliku).
  const signedUrl = await createSignedDownloadUrl(
    STORAGE_BUCKETS.products,
    record.order.productStorageKey,
    300,
  );

  // Licznik zwiększamy atomowo i warunkowo, aby równoległe żądania nie przekroczyły
  // limitu (TOCTOU między odczytem a zapisem). Jeśli w międzyczasie wykorzystano
  // ostatnie pobranie lub token wygasł, `count` = 0 → odsyłamy na stronę statusu
  // bez wydania pliku (utworzony wcześniej signed URL po prostu wygaśnie nieużyty).
  const { count } = await prisma.downloadToken.updateMany({
    where: {
      id: record.id,
      downloadCount: { lt: record.maxDownloads },
      expiresAt: { gt: new Date() },
    },
    data: { downloadCount: { increment: 1 } },
  });

  if (count === 0) {
    return noStore(NextResponse.redirect(statusUrl));
  }

  return noStore(NextResponse.redirect(signedUrl));
}

/**
 * HEAD: odpowiadamy bez efektów ubocznych. Podglądy linków, skanery poczty czy
 * ewentualny prefetch przeglądarki NIE MOGĄ zużywać limitu pobrań — dlatego HEAD
 * nigdy nie zwiększa licznika ani nie tworzy signed URL.
 */
export async function HEAD() {
  return noStore(new NextResponse(null, { status: 200 }));
}
