import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-auth";
import { LeadsTable, type LeadRow } from "@/components/admin/leads-table";
import type { LeadStatusValue } from "@/lib/lead-status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panel leadów",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await getAdminUser();
  if (!user) {
    redirect("/admin/login");
  }

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  const rows: LeadRow[] = leads.map((l) => ({
    id: l.id,
    caseType: l.caseType,
    description: l.description,
    name: l.name,
    email: l.email,
    phone: l.phone,
    partnerCode: l.partnerCode,
    status: l.status as LeadStatusValue,
    utmSource: l.utmSource,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <div className="container py-10">
      <h1 className="text-2xl md:text-3xl">Panel leadów</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Zalogowano jako {user.email}.
      </p>
      <div className="mt-8">
        <LeadsTable leads={rows} />
      </div>
    </div>
  );
}
