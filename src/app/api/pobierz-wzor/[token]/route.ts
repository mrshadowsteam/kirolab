import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/fulfillment";
import { createSignedDownloadUrl, STORAGE_BUCKETS } from "@/lib/supabase/storage";

/**
 * Pobranie darmowego lead magnetu: link ważny 30 dni, BEZ limitu pobrań.
 * Świadomie oddzielone od logiki tokenów sklepowych.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } },
) {
  const record = await prisma.leadMagnetToken.findUnique({
    where: { tokenHash: hashToken(params.token) },
  });

  if (!record) {
    return new NextResponse("Nieprawidłowy link.", { status: 404 });
  }
  if (record.expiresAt.getTime() < Date.now()) {
    return new NextResponse("Link wygasł (był ważny 30 dni).", { status: 410 });
  }

  const signedUrl = await createSignedDownloadUrl(
    STORAGE_BUCKETS.leadMagnets,
    record.storageKey,
    300,
  );
  return NextResponse.redirect(signedUrl);
}
