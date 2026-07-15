import "server-only";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/fulfillment";
import { sendTransactionalEmail } from "@/lib/email/brevo";
import { siteConfig } from "@/lib/site-config";

/** Lead magnet: link ważny 30 dni, bez limitu pobrań (osobny od tokenów sklepu). */
export const LEAD_MAGNET_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Wydaje darmowy wzór po potwierdzeniu newslettera: tworzy token (30 dni),
 * wysyła e-mail z linkiem i zwraca jawny token (do bezpośredniego pobrania na
 * stronie potwierdzenia). Zwraca null, gdy nie skonfigurowano pliku.
 */
export async function issueLeadMagnet(email: string): Promise<string | null> {
  const storageKey = process.env.LEAD_MAGNET_STORAGE_KEY;
  if (!storageKey) {
    console.error("Brak LEAD_MAGNET_STORAGE_KEY — nie wydano lead magnetu.");
    return null;
  }

  const token = randomBytes(32).toString("hex");
  await prisma.leadMagnetToken.create({
    data: {
      email,
      tokenHash: hashToken(token),
      storageKey,
      expiresAt: new Date(Date.now() + LEAD_MAGNET_TTL_MS),
    },
  });

  const url = `${siteConfig.url}/api/pobierz-wzor/${token}`;
  await sendTransactionalEmail({
    to: [{ email }],
    subject: "Twój darmowy wzór dokumentu — Smart Obywatel",
    htmlContent:
      `<p>Dziękujemy za potwierdzenie zapisu do newslettera!</p>` +
      `<p>Pobierz obiecany darmowy wzór dokumentu (link ważny 30 dni):</p>` +
      `<p><a href="${url}">Pobierz darmowy wzór</a></p>`,
  });

  return token;
}
