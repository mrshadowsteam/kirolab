import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-auth";

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

/** Eksport leadów do CSV (tylko zalogowany właściciel). */
export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return new NextResponse("Brak autoryzacji.", { status: 401 });
  }

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  const header = [
    "Data",
    "Status",
    "Sprawa",
    "Imię",
    "E-mail",
    "Telefon",
    "Kod partnera",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "Zgoda RODO",
    "Przekazano partnerowi",
    "Opis",
  ];

  const rows = leads.map((l) => [
    l.createdAt.toISOString(),
    l.status,
    l.caseType,
    l.name,
    l.email,
    l.phone ?? "",
    l.partnerCode,
    l.utmSource ?? "",
    l.utmMedium ?? "",
    l.utmCampaign ?? "",
    l.utmContent ?? "",
    l.utmTerm ?? "",
    l.consentAt.toISOString(),
    l.forwardedAt?.toISOString() ?? "",
    l.description,
  ]);

  const csv =
    "\uFEFF" +
    [header, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="leady.csv"',
    },
  });
}
