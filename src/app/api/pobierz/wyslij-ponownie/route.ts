import { type NextRequest, NextResponse } from "next/server";
import {
  hashToken,
  regenerateDownloadToken,
  sendDownloadEmail,
} from "@/lib/fulfillment";

/**
 * „Wyślij ponownie": regeneruje token na podstawie starego (posiadanie starego
 * linku potwierdza wcześniejszy dostęp) i ponownie wysyła e-mail z plikiem.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    token?: unknown;
  } | null;

  if (!body || typeof body.token !== "string") {
    return NextResponse.json({ error: "Brak tokenu." }, { status: 400 });
  }

  const result = await regenerateDownloadToken(hashToken(body.token));
  if (!result) {
    return NextResponse.json(
      { error: "Nie znaleziono zamówienia dla tego linku." },
      { status: 404 },
    );
  }

  await sendDownloadEmail(result.order, result.token);
  return NextResponse.json({ ok: true });
}
