import type { Metadata } from "next";
import { CalculatorShell } from "@/components/calculators/calculator-shell";
import { OdprawaCalculator } from "@/components/calculators/odprawa-calculator";
import { DEFAULT_MINIMUM_WAGE_GROSZE } from "@/lib/calculators/odprawa";
import { getSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Kalkulator odprawy",
  description:
    "Oszacuj wysokość odprawy przy zwolnieniu z przyczyn niedotyczących pracownika (pracodawca 20+ osób).",
  alternates: { canonical: "/kalkulatory/odprawa" },
};

export const revalidate = 3600;

export default async function OdprawaPage() {
  const settings = await getSettings();
  const minimumWageGrosze =
    settings?.minimumWageGrosze ?? DEFAULT_MINIMUM_WAGE_GROSZE;

  return (
    <CalculatorShell
      title="Kalkulator odprawy"
      description="Oszacuj wysokość należnej odprawy na podstawie stażu pracy i miesięcznego wynagrodzenia."
    >
      <OdprawaCalculator minimumWageGrosze={minimumWageGrosze} />
    </CalculatorShell>
  );
}
