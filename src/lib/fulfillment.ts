import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { Order } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email/brevo";
import { createInvoiceForOrder } from "@/lib/invoicing/fakturownia";
import { siteConfig } from "@/lib/site-config";
import { formatPln } from "@/lib/utils";

/** Ważność linku do pobrania: 72 godziny. */
export const DOWNLOAD_TTL_MS = 72 * 60 * 60 * 1000;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/** Tworzy nowy token pobrania dla zamówienia i zwraca jawny token. */
export async function createDownloadToken(orderId: string): Promise<string> {
  const token = generateToken();
  await prisma.downloadToken.create({
    data: {
      orderId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + DOWNLOAD_TTL_MS),
    },
  });
  return token;
}

/** Regeneruje token dla istniejącego (np. wygasłego) — „wyślij ponownie". */
export async function regenerateDownloadToken(
  oldTokenHash: string,
): Promise<{ order: Order; token: string } | null> {
  const existing = await prisma.downloadToken.findUnique({
    where: { tokenHash: oldTokenHash },
    include: { order: true },
  });
  if (!existing) return null;

  const token = generateToken();
  await prisma.downloadToken.update({
    where: { id: existing.id },
    data: {
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + DOWNLOAD_TTL_MS),
      downloadCount: 0,
    },
  });
  return { order: existing.order, token };
}

export async function sendDownloadEmail(
  order: Order,
  token: string,
): Promise<void> {
  const url = `${siteConfig.url}/pobierz/${token}`;
  await sendTransactionalEmail({
    to: [{ email: order.buyerEmail, name: order.buyerName ?? undefined }],
    subject: `Twój wzór: ${order.productTitle}`,
    htmlContent:
      `<p>Dziękujemy za zakup „${order.productTitle}" (${formatPln(order.amountGrosze)}).</p>` +
      `<p>Pobierz plik poniżej. Link jest ważny 72 godziny i pozwala na maksymalnie 3 pobrania:</p>` +
      `<p><a href="${url}">Pobierz dokument</a></p>`,
  });
}

/**
 * Realizacja opłaconego zamówienia: token pobrania + automatyczna faktura + e-mail.
 * Błąd faktury nie blokuje dostarczenia pliku (logujemy i kontynuujemy).
 */
export async function fulfillPaidOrder(order: Order): Promise<void> {
  const token = await createDownloadToken(order.id);

  try {
    const { invoiceId } = await createInvoiceForOrder({
      orderId: order.id,
      buyerName: order.buyerName ?? undefined,
      buyerEmail: order.buyerEmail,
      companyName: order.companyName ?? undefined,
      companyNip: order.companyNip ?? undefined,
      productTitle: order.productTitle,
      amountGrosze: order.amountGrosze,
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { invoiceId },
    });
  } catch (error) {
    console.error("Błąd wystawiania faktury (kontynuuję realizację):", error);
  }

  await sendDownloadEmail(order, token);
}
