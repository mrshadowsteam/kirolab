"use client";

import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type LeadStatusValue,
} from "@/lib/lead-status";
import { formatDate } from "@/lib/utils";

export interface LeadRow {
  id: string;
  caseType: string;
  description: string;
  name: string;
  email: string;
  phone: string | null;
  partnerCode: string;
  status: LeadStatusValue;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  createdAt: string;
}

export function LeadsTable({ leads }: { leads: LeadRow[] }) {
  const [rows, setRows] = useState<LeadRow[]>(leads);
  const [filter, setFilter] = useState<"all" | LeadStatusValue>("all");

  const visible =
    filter === "all" ? rows : rows.filter((r) => r.status === filter);

  async function updateStatus(id: string, status: LeadStatusValue) {
    const res = await fetch("/api/admin/lead-status", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <label htmlFor="filter" className="mr-2 text-sm font-medium">
            Filtruj status:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | LeadStatusValue)
            }
            className="rounded-md border border-border bg-white px-3 py-2"
          >
            <option value="all">Wszystkie ({rows.length})</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <a
          href="/api/admin/leads/export"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Eksport CSV
        </a>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <caption className="sr-only">
            Lista leadów z danymi kontaktowymi, źródłem i statusem obsługi
          </caption>
          <thead>
            <tr className="border-b border-border text-left">
              <th scope="col" className="p-2">
                Data
              </th>
              <th scope="col" className="p-2">
                Sprawa
              </th>
              <th scope="col" className="p-2">
                Kontakt
              </th>
              <th scope="col" className="p-2">
                Opis
              </th>
              <th scope="col" className="p-2">
                Partner / źródło
              </th>
              <th scope="col" className="p-2">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((lead) => (
              <tr key={lead.id} className="border-b border-border align-top">
                <td className="p-2 whitespace-nowrap text-muted-foreground">
                  {formatDate(lead.createdAt)}
                </td>
                <td className="p-2">{lead.caseType}</td>
                <td className="p-2">
                  <div>{lead.name}</div>
                  <div className="text-muted-foreground">{lead.email}</div>
                  {lead.phone ? (
                    <div className="text-muted-foreground">{lead.phone}</div>
                  ) : null}
                </td>
                <td className="p-2 max-w-xs text-muted-foreground">
                  {lead.description}
                </td>
                <td className="p-2 whitespace-nowrap">
                  <div>{lead.partnerCode}</div>
                  {[
                    ["source", lead.utmSource],
                    ["medium", lead.utmMedium],
                    ["campaign", lead.utmCampaign],
                    ["content", lead.utmContent],
                    ["term", lead.utmTerm],
                  ]
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div key={label} className="text-xs text-muted-foreground">
                        {label}: {value}
                      </div>
                    ))}
                </td>
                <td className="p-2">
                  <select
                    value={lead.status}
                    onChange={(e) =>
                      updateStatus(lead.id, e.target.value as LeadStatusValue)
                    }
                    className="rounded-md border border-border bg-white px-2 py-1"
                    aria-label={`Status leada ${lead.name}`}
                  >
                    {LEAD_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {LEAD_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-muted-foreground">
                  Brak leadów w tym filtrze.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
