import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProductBySlug } from "@/lib/content";
import { getPaymentProvider } from "@/lib/payments";
import { isValidNip, normalizeNip } from "@/lib/nip";
import { siteConfig } from "@/lib/site-config";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Inicjuje zakup: tworzy zamówienie (pending) i rejestruje płatność u operatora.
 * Cena pochodzi z CMS (serwer) — nigdy nie ufamy cenie z klienta.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    productSlug?: unknown;
    email?: unknown;
    buyerName?: unknown;
    wantsCompanyInvoice?: unknown;
    companyName?: unknown;
    companyNip?: unknown;
    consent?: unknown;
  } | null;

  if (!body || typeof body.productSlug !== "string" || typeof body.email !== "string") {
    return NextResponse.json({ error: "Brak wymaganych danych." }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Nieprawidłowy adres e-mail." }, { status: 400 });
  }

  // Akceptacja regulaminu jest walidowana również po stronie serwera —
  // blokada po stronie klienta jest łatwa do obejścia, a zgoda na dostarczenie
  // treści cyfrowej (zrzeczenie się prawa odstąpienia) ma znaczenie prawne.
  if (body.consent !== true) {
    return NextResponse.json(
      { error: "Wymagana jest akceptacja regulaminu sklepu." },
      { status: 400 },
    );
  }

  const wantsCompanyInvoice = body.wantsCompanyInvoice === true;
  const companyName =
    typeof body.companyName === "string" ? body.companyName.trim() : "";
  const rawNip = typeof body.companyNip === "string" ? body.companyNip : "";
  // NIP przekazywany do Fakturowni przechowujemy w postaci znormalizowanej (same cyfry).
  const companyNip = normalizeNip(rawNip);

  if (wantsCompanyInvoice && (!companyName || !isValidNip(rawNip))) {
    return NextResponse.json(
      { error: "Do faktury na firmę podaj nazwę firmy i poprawny NIP." },
      { status: 400 },
    );
  }

  const product = await getProductBySlug(body.productSlug);
  if (!product) {
    return NextResponse.json({ error: "Nie znaleziono produktu." }, { status: 404 });
  }

  const buyerName =
    typeof body.buyerName === "string" ? body.buyerName.trim() : null;

  const order = await prisma.order.create({
    data: {
      productSanityId: product._id,
      productTitle: product.title,
      productStorageKey: product.storageKey,
      amountGrosze: product.priceGrosze,
      buyerEmail: email,
      buyerName,
      wantsCompanyInvoice,
      companyName: wantsCompanyInvoice ? companyName : null,
      companyNip: wantsCompanyInvoice ? companyNip : null,
      paymentProvider: process.env.PAYMENT_PROVIDER ?? "przelewy24",
      status: "pending",
      // Zgoda RODO (akceptacja regulaminu + zrzeczenie prawa odstąpienia)
      // zapisywana z czasem; kontekstem/źródłem zgody jest to zamówienie.
      consentAt: new Date(),
    },
  });

  try {
    const provider = getPaymentProvider();
    const payment = await provider.createPayment({
      orderId: order.id,
      amountGrosze: order.amountGrosze,
      description: product.title,
      email,
      urlReturn: `${siteConfig.url}/sklep/${product.slug}/dziekujemy`,
      urlStatus: `${siteConfig.url}/api/webhooks/payments`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentRef: payment.providerRef },
    });

    return NextResponse.json({ redirectUrl: payment.redirectUrl });
  } catch (error) {
    console.error("Błąd inicjacji płatności:", error);
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "failed" },
    });
    return NextResponse.json(
      { error: "Nie udało się rozpocząć płatności. Spróbuj ponownie." },
      { status: 502 },
    );
  }
}
