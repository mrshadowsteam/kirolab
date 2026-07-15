/** Statusy leada + polskie etykiety (współdzielone klient/serwer). */
export const LEAD_STATUSES = [
  "new",
  "forwarded",
  "in_contact",
  "closed",
] as const;

export type LeadStatusValue = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatusValue, string> = {
  new: "Nowy",
  forwarded: "Przekazany",
  in_contact: "W kontakcie",
  closed: "Zamknięty",
};

export function isLeadStatus(value: string): value is LeadStatusValue {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}
