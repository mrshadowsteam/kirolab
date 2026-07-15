"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { ResultEmailCapture } from "./result-email-capture";
import { inputClass } from "./styles";
import {
  calcEkwiwalent,
  type EkwiwalentResult,
} from "@/lib/calculators/ekwiwalent";
import { formatPln, parsePlnToGrosze } from "@/lib/utils";

export function EkwiwalentCalculator({
  coefficient,
}: {
  coefficient: number;
}) {
  const [days, setDays] = useState("");
  const [base, setBase] = useState("");
  const [result, setResult] = useState<EkwiwalentResult | null>(null);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const parsedDays = Number(days.replace(",", "."));
    const baseGrosze = parsePlnToGrosze(base);

    if (days.trim() === "" || !Number.isFinite(parsedDays) || parsedDays <= 0) {
      setResult(null);
      setError("Podaj poprawną liczbę dni niewykorzystanego urlopu.");
      return;
    }
    if (baseGrosze === null || baseGrosze <= 0) {
      setResult(null);
      setError("Podaj poprawną miesięczną podstawę wynagrodzenia.");
      return;
    }

    setResult(
      calcEkwiwalent({
        unusedDays: parsedDays,
        monthlyBaseGrosze: baseGrosze,
        coefficient,
      }),
    );
  }

  return (
    <div>
      <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        Wyliczenie dla <strong>pełnego etatu</strong>. Używany współczynnik
        ekwiwalentu: <strong>{coefficient}</strong> (konfigurowalny). Ekwiwalent
        = liczba dni × (podstawa miesięczna ÷ współczynnik).
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="days" className="text-sm font-medium">
            Liczba dni niewykorzystanego urlopu
          </label>
          <input
            id="days"
            inputMode="decimal"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className={inputClass}
            placeholder="np. 12"
          />
        </div>
        <div>
          <label htmlFor="base" className="text-sm font-medium">
            Miesięczna podstawa wynagrodzenia (zł)
          </label>
          <input
            id="base"
            inputMode="decimal"
            value={base}
            onChange={(e) => setBase(e.target.value)}
            className={inputClass}
            placeholder="np. 6000"
          />
        </div>
        <Button type="submit" variant="primary">
          Oblicz ekwiwalent
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
              Szacunkowy ekwiwalent za urlop
            </p>
            <p className="mt-1 font-display text-3xl font-semibold text-primary">
              {formatPln(result.amountGrosze)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Stawka za 1 dzień: {formatPln(result.dailyRateGrosze)}
            </p>
          </div>
          <ResultEmailCapture
            source="kalkulator-ekwiwalent"
            resultSummary={`Szacunkowy ekwiwalent za urlop: ${formatPln(result.amountGrosze)}.`}
          />
        </div>
      ) : null}
    </div>
  );
}
