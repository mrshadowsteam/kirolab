"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ResultEmailCapture } from "./result-email-capture";
import { inputClass } from "./styles";
import {
  calcSzkoda,
  MIN_OFFERS_FOR_RELIABLE,
  type SzkodaResult,
} from "@/lib/calculators/szkoda";
import { formatPln, parsePlnToGrosze } from "@/lib/utils";

export function SzkodaCalculator() {
  const [insurer, setInsurer] = useState("");
  const [offers, setOffers] = useState<string[]>(["", "", ""]);
  const [result, setResult] = useState<SzkodaResult | null>(null);
  const [error, setError] = useState("");

  function updateOffer(index: number, value: string) {
    setOffers((prev) => prev.map((v, i) => (i === index ? value : v)));
  }
  function addOffer() {
    setOffers((prev) => [...prev, ""]);
  }
  function removeOffer(index: number) {
    setOffers((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const insurerGrosze = parsePlnToGrosze(insurer);
    if (insurerGrosze === null || insurerGrosze <= 0) {
      setResult(null);
      setError("Podaj poprawną wycenę ubezpieczyciela.");
      return;
    }
    const offersGrosze: number[] = [];
    for (const offer of offers) {
      if (offer.trim() === "") continue;
      const grosze = parsePlnToGrosze(offer);
      if (grosze === null || grosze <= 0) {
        setResult(null);
        setError("Jedna z ofert ma nieprawidłową wartość.");
        return;
      }
      offersGrosze.push(grosze);
    }
    if (offersGrosze.length === 0) {
      setResult(null);
      setError("Dodaj co najmniej jedną ofertę rynkową.");
      return;
    }

    setResult(calcSzkoda({ insurerValuationGrosze: insurerGrosze, offersGrosze }));
  }

  return (
    <div>
      <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        Wpisz wycenę ubezpieczyciela oraz ceny ofertowe podobnych aut (np. z
        portali ogłoszeniowych). Policzymy medianę i średnią rynku oraz różnicę
        względem wyceny ubezpieczyciela.
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="insurer" className="text-sm font-medium">
            Wycena ubezpieczyciela (zł)
          </label>
          <input
            id="insurer"
            inputMode="decimal"
            value={insurer}
            onChange={(e) => setInsurer(e.target.value)}
            className={inputClass}
            placeholder="np. 28000"
          />
        </div>

        <fieldset>
          <legend className="text-sm font-medium">
            Oferty rynkowe podobnych aut (zł)
          </legend>
          <div className="mt-2 space-y-2">
            {offers.map((offer, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  inputMode="decimal"
                  value={offer}
                  onChange={(e) => updateOffer(index, e.target.value)}
                  className={inputClass}
                  aria-label={`Oferta ${index + 1}`}
                  placeholder="np. 34000"
                />
                {offers.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeOffer(index)}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border"
                    aria-label={`Usuń ofertę ${index + 1}`}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOffer}
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-strong hover:underline"
          >
            <Plus className="h-4 w-4" aria-hidden /> Dodaj ofertę
          </button>
        </fieldset>

        <Button type="submit" variant="primary">
          Porównaj z rynkiem
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Mediana ofert</p>
                <p className="font-display text-xl font-semibold">
                  {formatPln(result.medianGrosze)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Średnia ofert</p>
                <p className="font-display text-xl font-semibold">
                  {formatPln(result.meanGrosze)}
                </p>
              </div>
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                Możliwe zaniżenie (mediana − wycena ubezpieczyciela)
              </p>
              <p
                className={`mt-1 font-display text-2xl font-semibold ${
                  result.diffFromMedianGrosze > 0
                    ? "text-amber-strong"
                    : "text-foreground"
                }`}
              >
                {formatPln(result.diffFromMedianGrosze)}
              </p>
            </div>
            {!result.reliable ? (
              <p className="mt-3 text-xs text-amber-strong">
                Podano mniej niż {MIN_OFFERS_FOR_RELIABLE} oferty — wynik jest
                mało miarodajny. Dodaj więcej porównań.
              </p>
            ) : null}
          </div>

          {result.diffFromMedianGrosze > 0 ? (
            <div className="rounded-lg border border-border bg-primary/5 p-5">
              <p className="text-sm">
                Twoja wycena może być zaniżona. Rozważ odwołanie — gotowy wzór
                pisma znajdziesz w sklepie.
              </p>
              <Link
                href="/sklep"
                className={`mt-3 ${buttonVariants({ variant: "teal", size: "sm" })}`}
              >
                Zobacz wzory odwołań
              </Link>
            </div>
          ) : null}

          <ResultEmailCapture
            source="kalkulator-szkoda-calkowita"
            resultSummary={`Mediana rynku: ${formatPln(result.medianGrosze)}, możliwe zaniżenie: ${formatPln(result.diffFromMedianGrosze)}.`}
          />
        </div>
      ) : null}
    </div>
  );
}
