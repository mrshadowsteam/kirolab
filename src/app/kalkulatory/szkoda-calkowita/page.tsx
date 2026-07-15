import type { Metadata } from "next";
import { CalculatorShell } from "@/components/calculators/calculator-shell";
import { SzkodaCalculator } from "@/components/calculators/szkoda-calculator";

export const metadata: Metadata = {
  title: "Kalkulator zaniżenia szkody całkowitej",
  description:
    "Porównaj wycenę ubezpieczyciela z cenami rynkowymi podobnych aut i oszacuj możliwe zaniżenie.",
  alternates: { canonical: "/kalkulatory/szkoda-calkowita" },
};

export default function SzkodaPage() {
  return (
    <CalculatorShell
      title="Kalkulator zaniżenia szkody całkowitej"
      description="Wprowadź oferty rynkowe podobnych aut i porównaj je z wyceną ubezpieczyciela."
    >
      <SzkodaCalculator />
    </CalculatorShell>
  );
}
