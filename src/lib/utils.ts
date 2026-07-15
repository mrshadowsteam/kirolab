import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Łączy klasy Tailwind z rozwiązywaniem konfliktów. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatuje kwotę w groszach (PLN) na czytelny string, np. 4900 -> "49,00 zł". */
export function formatPln(grosze: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(grosze / 100);
}

/** Parsuje kwotę w zł (np. "1 234,56" / "1234.56") na grosze; null gdy błędna. */
export function parsePlnToGrosze(input: string): number | null {
  const normalized = input.replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100);
}

/** Formatuje datę ISO na polski format, np. "15 lipca 2026". */
export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
