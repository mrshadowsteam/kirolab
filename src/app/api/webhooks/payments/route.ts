import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payments";
import { fulfillPaidOrder } from "@/lib/fulfillment";

/**
 * Webhook operatora płatności (Przelewy24).
 * 1. Weryfikacja podpisu powiadomienia.
 * 2. Potwierdzenie transakcji server-to-server.
 * 3. Oznaczenie zamówienia jako opłacone + realizacja (token, faktura, e-mail).
 * Idempotentny: ponowne wywołanie dla opłaconego zamówienia nic nie zmienia.
 */
export async function POST(req: NextRequest) {
  const payload = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!payload) {
    return new NextResponse("Nieprawidłowe dane", { status: 400 });
  }

  const provider = getPaymentProvider();
  if (!provider.verifyWebhookSignature(payload)) {
    return new NextResponse("Nieprawidłowy podpis", { status: 401 });
  }

  const sessionId = typeof payload.sessionId === "string" ? payload.sessionId : null;
  const p24OrderId = Number(payload.orderId);
  if (!sessionId || !Number.isFinite(p24OrderId)) {
    return new NextResponse("Brak identyfikatorów transakcji", { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: sessionId } });
  if (!order) {
    return new NextResponse("Nie znaleziono zamówienia", { status: 404 });
  }
  if (order.status === "paid") {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  const confirmed = await provider.confirmTransaction({
    sessionId,
    orderId: p24OrderId,
    amountGrosze: order.amountGrosze,
    currency: order.currency,
  });
  if (!confirmed) {
    return new NextResponse("Nie potwierdzono transakcji", { status: 400 });
  }

  const paidOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: "paid", paidAt: new Date() },
  });

  await fulfillPaidOrder(paidOrder);

  return NextResponse.json({ ok: true });
}
