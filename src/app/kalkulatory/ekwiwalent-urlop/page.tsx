import type { Metadata } from "next";
import { CalculatorShell } from "@/components/calculators/calculator-shell";
import { EkwiwalentCalculator } from "@/components/calculators/dynamic";
import { DEFAULT_EQUIVALENT_COEFFICIENT } from "@/lib/calculators/ekwiwalent";
import { getSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Kalkulator ekwiwalentu za urlop",
  description:
    "Policz ekwiwalent za niewykorzystany urlop wypoczynkowy na podstawie podstawy wynagrodzenia i liczby dni.",
  alternates: { canonical: "/kalkulatory/ekwiwalent-urlop" },
};

export const revalidate = 3600;

export default async function EkwiwalentPage() {
  const settings = await getSettings();
  const coefficient =
    settings?.equivalentCoefficient ?? DEFAULT_EQUIVALENT_COEFFICIENT;

  return (
    <CalculatorShell
      title="Kalkulator ekwiwalentu za urlop"
      description="Oszacuj ekwiwalent pieniężny za niewykorzystany urlop wypoczynkowy."
    >
      <EkwiwalentCalculator coefficient={coefficient} />
    </CalculatorShell>
  );
}
