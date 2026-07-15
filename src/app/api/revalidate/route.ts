import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Webhook Sanity -> rewalidacja ISR po publikacji treści.
 * Konfiguracja webhooka w Sanity: sekret = SANITY_REVALIDATE_SECRET,
 * projection: {"_type": _type}.
 */
export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type: string }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    );

    if (!isValidSignature) {
      return new NextResponse("Nieprawidłowy podpis webhooka", { status: 401 });
    }

    if (!body?._type) {
      return new NextResponse("Brak _type w treści", { status: 400 });
    }

    // Rewalidacja po typie dokumentu (tag = nazwa typu)
    revalidateTag(body._type);

    return NextResponse.json({ revalidated: true, type: body._type });
  } catch (err) {
    console.error("Błąd rewalidacji:", err);
    return new NextResponse("Błąd serwera", { status: 500 });
  }
}
