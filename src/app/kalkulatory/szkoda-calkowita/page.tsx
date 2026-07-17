import type { Metadata } from "next";
import { CalculatorShell } from "@/components/calculators/calculator-shell";
import { SzkodaCalculator } from "@/components/calculators/dynamic";
import { getProductForCalculator } from "@/lib/content";

export const metadata: Metadata = {
  title: "Kalkulator zaniżenia szkody całkowitej",
  description:
    "Porównaj wycenę ubezpieczyciela z cenami rynkowymi podobnych aut i oszacuj możliwe zaniżenie.",
  alternates: { canonical: "/kalkulatory/szkoda-calkowita" },
};

export const revalidate = 3600;

export default async function SzkodaPage() {
  // Wzór pisma powiązany z tym kalkulatorem pochodzi z CMS (pole
  // `relatedCalculator`), więc link nie jest zakodowany na stałe (wym. 3.13).
  const product = await getProductForCalculator("szkoda-calkowita");
  const relatedProduct = product
    ? { slug: product.slug, title: product.title }
    : null;

  return (
    <CalculatorShell
      title="Kalkulator zaniżenia szkody całkowitej"
      description="Wprowadź oferty rynkowe podobnych aut i porównaj je z wyceną ubezpieczyciela."
    >
      <SzkodaCalculator relatedProduct={relatedProduct} />
    </CalculatorShell>
  );
}
