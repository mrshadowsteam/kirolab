"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { ResultEmailCapture } from "./result-email-capture";
import { inputClass } from "./styles";
import { calcOdprawa, type OdprawaResult } from "@/lib/calculators/odprawa";
import { formatPln, parsePlnToGrosze } from "@/lib/utils";

export function OdprawaCalculator({
  minimumWageGrosze,
}: {
  minimumWageGrosze: number;
}) {
  const [years, setYears] = useState("");
  const [wage, setWage] = useState("");
  const [result, setResult] = useState<OdprawaResult | null>(null);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const parsedYears = Number(years.replace(",", "."));
    const wageGrosze = parsePlnToGrosze(wage);

    if (years.trim() === "" || !Number.isFinite(parsedYears) || parsedYears < 0) {
      setResult(null);
      setError("Podaj poprawny staż pracy (w latach).");
      return;
    }
    if (wageGrosze === null || wageGrosze <= 0) {
      setResult(null);
      setError("Podaj poprawne miesięczne wynagrodzenie brutto.");
      return;
    }

    setResult(
      calcOdprawa({
        yearsOfService: parsedYears,
        monthlyWageGrosze: wageGrosze,
        minimumWageGrosze,
      }),
    );
  }

  return (
    <div>
      <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        Dotyczy zwolnień z przyczyn <strong>niedotyczących pracownika</strong> u
        pracodawcy zatrudniającego co najmniej <strong>20 osób</strong> (ustawa o
        zwolnieniach grupowych). Staż liczony w pełnych latach.
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="years" className="text-sm font-medium">
            Staż pracy u tego pracodawcy (lata)
          </label>
          <input
            id="years"
            inputMode="decimal"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className={inputClass}
            placeholder="np. 5"
          />
        </div>
        <div>
          <label htmlFor="wage" className="text-sm font-medium">
            Miesięczne wynagrodzenie brutto (zł)
          </label>
          <input
            id="wage"
            inputMode="decimal"
            value={wage}
            onChange={(e) => setWage(e.target.value)}
            className={inputClass}
            placeholder="np. 6000"
          />
        </div>
        <Button type="submit" variant="primary">
          Oblicz odprawę
        </Button>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </form>

      {result ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-border bg-white p-5">
            <p className="text-sm text-muted-foreground">
              Szacunkowa odprawa ({result.months}× wynagrodzenie)
            </p>
            <p className="mt-1 font-display text-3xl font-semibold text-primary">
              {formatPln(result.amountGrosze)}
            </p>
            {result.capped ? (
              <p className="mt-2 text-xs text-amber-strong">
                Zastosowano ustawowy limit 15× minimalnego wynagrodzenia (
                {formatPln(result.capGrosze)}).
              </p>
            ) : null}
          </div>
          <ResultEmailCapture
            source="kalkulator-odprawa"
            resultSummary={`Szacunkowa odprawa: ${formatPln(result.amountGrosze)} (${result.months}× wynagrodzenie).`}
          />
        </div>
      ) : null}
    </div>
  );
}
