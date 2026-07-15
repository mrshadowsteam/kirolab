import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kalkulatory",
  description:
    "Darmowe kalkulatory: odprawa, ekwiwalent za urlop i zaniżenie szkody całkowitej. Wynik liczony po Twojej stronie, bez wysyłania danych.",
  alternates: { canonical: "/kalkulatory" },
};

const calculators = [
  {
    slug: "odprawa",
    title: "Kalkulator odprawy",
    description:
      "Oszacuj odprawę przy zwolnieniu z przyczyn niedotyczących pracownika.",
  },
  {
    slug: "ekwiwalent-urlop",
    title: "Ekwiwalent za urlop",
    description:
      "Policz ekwiwalent za niewykorzystany urlop wypoczynkowy.",
  },
  {
    slug: "szkoda-calkowita",
    title: "Zaniżenie szkody całkowitej",
    description:
      "Porównaj wycenę ubezpieczyciela z realnymi cenami rynkowymi podobnych aut.",
  },
];

export default function CalculatorsPage() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl md:text-4xl">Kalkulatory</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Szybko oszacuj, o jaką kwotę toczy się sprawa. Wynik liczony jest w
        Twojej przeglądarce — dane nie są wysyłane na serwer.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {calculators.map((calc) => (
          <Link
            key={calc.slug}
            href={`/kalkulatory/${calc.slug}`}
            className="group rounded-lg border border-border bg-white p-6 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary"
          >
            <h2 className="text-lg font-semibold group-hover:text-primary">
              {calc.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {calc.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
