import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-auth";
import { isLeadStatus } from "@/lib/lead-status";

/** Zmiana statusu leada (tylko zalogowany właściciel). */
export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    id?: unknown;
    status?: unknown;
  } | null;

  if (!body || typeof body.id !== "string" || typeof body.status !== "string") {
    return NextResponse.json({ error: "Brak danych." }, { status: 400 });
  }
  if (!isLeadStatus(body.status)) {
    return NextResponse.json({ error: "Nieprawidłowy status." }, { status: 400 });
  }

  try {
    await prisma.lead.update({
      where: { id: body.id },
      data: { status: body.status },
    });
  } catch {
    return NextResponse.json({ error: "Nie znaleziono leada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
