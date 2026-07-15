import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/fulfillment";
import { createSignedDownloadUrl, STORAGE_BUCKETS } from "@/lib/supabase/storage";
import { siteConfig } from "@/lib/site-config";

/**
 * Serwuje plik po walidacji tokenu: sprawdza ważność (72h) i limit pobrań (3),
 * inkrementuje licznik i przekierowuje do krótkotrwałego signed URL ze Storage.
 * Przy wygaśnięciu/limicie odsyła na stronę statusu (z opcją „wyślij ponownie").
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
    return NextResponse.redirect(statusUrl);
  }

  const expired = record.expiresAt.getTime() < Date.now();
  const limitReached = record.downloadCount >= record.maxDownloads;
  if (expired || limitReached) {
    return NextResponse.redirect(statusUrl);
  }

  if (!record.order.productStorageKey) {
    return new NextResponse("Plik jest niedostępny — skontaktuj się z nami.", {
      status: 500,
    });
  }

  await prisma.downloadToken.update({
    where: { id: record.id },
    data: { downloadCount: { increment: 1 } },
  });

  const signedUrl = await createSignedDownloadUrl(
    STORAGE_BUCKETS.products,
    record.order.productStorageKey,
    300,
  );

  return NextResponse.redirect(signedUrl);
}
