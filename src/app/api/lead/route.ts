import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/content";
import { sendTransactionalEmail } from "@/lib/email/brevo";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
function optStr(value: unknown): string | null {
  const v = str(value);
  return v ? v : null;
}
function esc(s: string): string {
  return s.replace(/[<>&]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;",
  );
}

/**
 * Zapis leada afiliacyjnego + automatyczne przekazanie partnerowi e-mailem.
 * Zapisuje UTM i kod partnera (fallback: defaultPartnerCode z CMS lub env).
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return NextResponse.json({ error: "Brak danych." }, { status: 400 });
  }

  const caseType = str(body.caseType);
  const description = str(body.description);
  const name = str(body.name);
  const email = str(body.email).toLowerCase();

  if (!caseType || !description || !name || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Uzupełnij rodzaj sprawy, opis, imię i poprawny e-mail." },
      { status: 400 },
    );
  }
  if (body.consent !== true) {
    return NextResponse.json(
      { error: "Wymagana zgoda na przekazanie danych partnerowi." },
      { status: 400 },
    );
  }

  let partnerCode = optStr(body.partnerCode);
  if (!partnerCode) {
    const settings = await getSettings();
    partnerCode =
      settings?.defaultPartnerCode ??
      process.env.DEFAULT_PARTNER_CODE ??
      "direct";
  }

  const phone = optStr(body.phone);
  const utmSource = optStr(body.utmSource);
  const utmMedium = optStr(body.utmMedium);
  const utmCampaign = optStr(body.utmCampaign);
  const utmContent = optStr(body.utmContent);
  const utmTerm = optStr(body.utmTerm);

  const lead = await prisma.lead.create({
    data: {
      caseType,
      description,
      name,
      email,
      phone,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      partnerCode,
      consentAt: new Date(),
      status: "new",
    },
  });

  const partnerEmail = process.env.PARTNER_LEAD_EMAIL;
  if (partnerEmail) {
    try {
      await sendTransactionalEmail({
        to: [{ email: partnerEmail }],
        subject: `Nowy lead: ${caseType}`,
        htmlContent:
          `<h2>Nowy lead ze Smart Obywatel</h2>` +
          `<p><strong>Rodzaj sprawy:</strong> ${esc(caseType)}</p>` +
          `<p><strong>Opis:</strong> ${esc(description)}</p>` +
          `<p><strong>Imię:</strong> ${esc(name)}</p>` +
          `<p><strong>E-mail:</strong> ${esc(email)}</p>` +
          `<p><strong>Telefon:</strong> ${esc(phone ?? "—")}</p>` +
          `<p><strong>Kod partnera:</strong> ${esc(partnerCode)}</p>` +
          `<h3>UTM</h3>` +
          `<p><strong>source:</strong> ${esc(utmSource ?? "—")}</p>` +
          `<p><strong>medium:</strong> ${esc(utmMedium ?? "—")}</p>` +
          `<p><strong>campaign:</strong> ${esc(utmCampaign ?? "—")}</p>` +
          `<p><strong>content:</strong> ${esc(utmContent ?? "—")}</p>` +
          `<p><strong>term:</strong> ${esc(utmTerm ?? "—")}</p>`,
      });
      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: "forwarded", forwardedAt: new Date() },
      });
    } catch (error) {
      console.error("Błąd przekazania leada partnerowi:", error);
    }
  }

  return NextResponse.json({ ok: true });
}
