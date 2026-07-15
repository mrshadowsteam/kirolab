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
