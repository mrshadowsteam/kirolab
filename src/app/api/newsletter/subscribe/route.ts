import { type NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email/brevo";
import { siteConfig } from "@/lib/site-config";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Inicjuje zapis do newslettera z double opt-in.
 * Wysyła e-mail potwierdzający (z opcjonalnym wynikiem kalkulatora).
 * Potwierdzenie (GET /newsletter/potwierdz) oraz lead magnet — Faza 7.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    email?: unknown;
    consent?: unknown;
    source?: unknown;
    resultSummary?: unknown;
  } | null;

  if (!body || typeof body.email !== "string" || body.consent !== true) {
    return NextResponse.json(
      { error: "Wymagany e-mail oraz zgoda RODO." },
      { status: 400 },
    );
  }

  const email = body.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Nieprawidłowy adres e-mail." },
      { status: 400 },
    );
  }

  const source = typeof body.source === "string" ? body.source : "unknown";
  const resultSummary =
    typeof body.resultSummary === "string" ? body.resultSummary : null;

  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: {
      confirmTokenHash: tokenHash,
      source,
      consentAt: new Date(),
      status: "pending",
    },
    create: {
      email,
      confirmTokenHash: tokenHash,
      source,
      consentAt: new Date(),
      status: "pending",
    },
  });

  const confirmUrl = `${siteConfig.url}/newsletter/potwierdz?token=${token}&email=${encodeURIComponent(email)}`;
  const resultBlock = resultSummary
    ? `<p>Twój wynik z kalkulatora:</p><blockquote>${resultSummary}</blockquote>`
    : "";

  await sendTransactionalEmail({
    to: [{ email }],
    subject: "Potwierdź zapis do newslettera Smart Obywatel",
    htmlContent:
      `<p>Cześć!</p>` +
      resultBlock +
      `<p>Aby dokończyć zapis do newslettera i odebrać darmowy wzór dokumentu, potwierdź swój adres:</p>` +
      `<p><a href="${confirmUrl}">Potwierdzam zapis</a></p>` +
      `<p>Jeśli to nie Ty — zignoruj tę wiadomość.</p>`,
  });

  return NextResponse.json({ ok: true });
}
