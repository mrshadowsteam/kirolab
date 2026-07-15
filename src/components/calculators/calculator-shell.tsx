import type { ReactNode } from "react";
import { legalDisclaimer } from "@/lib/site-config";

/** Wspólny szkielet strony kalkulatora: tytuł, opis, narzędzie, disclaimer. */
export function CalculatorShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-3xl md:text-4xl">{title}</h1>
      <p className="mt-3 text-muted-foreground">{description}</p>
      <div className="mt-8">{children}</div>
      <p className="mt-8 rounded-md border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        {legalDisclaimer}
      </p>
    </div>
  );
}
