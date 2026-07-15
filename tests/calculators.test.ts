import { describe, it, expect } from "vitest";
import { calcOdprawa, severanceMonths } from "@/lib/calculators/odprawa";
import { calcEkwiwalent } from "@/lib/calculators/ekwiwalent";
import { calcSzkoda, MIN_OFFERS_FOR_RELIABLE } from "@/lib/calculators/szkoda";

const MIN_WAGE = 466600; // 4666,00 zł

describe("Kalkulator odprawy — liczba miesięcy wg stażu", () => {
  it("staż < 2 lata → 1 pensja", () => {
    expect(severanceMonths(0)).toBe(1);
    expect(severanceMonths(1)).toBe(1);
    expect(severanceMonths(1.99)).toBe(1);
  });

  it("staż 2–8 lat → 2 pensje (granice włącznie)", () => {
    expect(severanceMonths(2)).toBe(2);
    expect(severanceMonths(5)).toBe(2);
    expect(severanceMonths(8)).toBe(2);
  });

  it("staż > 8 lat → 3 pensje", () => {
    expect(severanceMonths(8.01)).toBe(3);
    expect(severanceMonths(9)).toBe(3);
    expect(severanceMonths(40)).toBe(3);
  });
});

describe("Kalkulator odprawy — kwota i limit 15×", () => {
  it("liczy krotność wynagrodzenia bez limitu", () => {
    const r = calcOdprawa({
      yearsOfService: 5,
      monthlyWageGrosze: 600000, // 6000 zł
      minimumWageGrosze: MIN_WAGE,
    });
    expect(r.months).toBe(2);
    expect(r.amountGrosze).toBe(1200000);
    expect(r.capped).toBe(false);
  });

  it("stosuje limit 15× minimalnego wynagrodzenia", () => {
    const r = calcOdprawa({
      yearsOfService: 20, // 3 pensje
      monthlyWageGrosze: 5000000, // 50 000 zł
      minimumWageGrosze: MIN_WAGE,
    });
    const cap = 15 * MIN_WAGE;
    expect(r.months).toBe(3);
    expect(r.capped).toBe(true);
    expect(r.amountGrosze).toBe(cap);
    expect(r.capGrosze).toBe(cap);
  });

  it("kwota dokładnie równa limitowi nie jest oznaczana jako przekroczona", () => {
    // 1 pensja = 15× min → raw == cap
    const r = calcOdprawa({
      yearsOfService: 1,
      monthlyWageGrosze: 15 * MIN_WAGE,
      minimumWageGrosze: MIN_WAGE,
    });
    expect(r.capped).toBe(false);
    expect(r.amountGrosze).toBe(15 * MIN_WAGE);
  });
});

describe("Kalkulator ekwiwalentu za urlop", () => {
  it("liczy ekwiwalent dla pełnego etatu", () => {
    const r = calcEkwiwalent({
      unusedDays: 10,
      monthlyBaseGrosze: 600000, // 6000 zł
      coefficient: 20,
    });
    expect(r.dailyRateGrosze).toBe(30000); // 300 zł/dzień
    expect(r.amountGrosze).toBe(300000); // 3000 zł
  });

  it("zwraca zero przy niepoprawnym współczynniku", () => {
    const r = calcEkwiwalent({
      unusedDays: 10,
      monthlyBaseGrosze: 600000,
      coefficient: 0,
    });
    expect(r.amountGrosze).toBe(0);
    expect(r.dailyRateGrosze).toBe(0);
  });
});

describe("Kalkulator zaniżenia szkody całkowitej", () => {
  it("liczy medianę i średnią dla nieparzystej liczby ofert", () => {
    const r = calcSzkoda({
      insurerValuationGrosze: 2800000, // 28 000 zł
      offersGrosze: [3000000, 3400000, 3200000],
    });
    expect(r.count).toBe(3);
    expect(r.medianGrosze).toBe(3200000);
    expect(r.meanGrosze).toBe(3200000);
    expect(r.diffFromMedianGrosze).toBe(400000); // zaniżenie 4000 zł
    expect(r.reliable).toBe(true);
  });

  it("liczy medianę dla parzystej liczby ofert", () => {
    const r = calcSzkoda({
      insurerValuationGrosze: 3000000,
      offersGrosze: [3000000, 3400000],
    });
    expect(r.medianGrosze).toBe(3200000);
    expect(r.count).toBe(2);
    expect(r.reliable).toBe(false); // < MIN_OFFERS_FOR_RELIABLE
  });

  it("ignoruje wartości niedodatnie", () => {
    const r = calcSzkoda({
      insurerValuationGrosze: 2800000,
      offersGrosze: [3000000, 0, -500, 3400000],
    });
    expect(r.count).toBe(2);
    expect(r.meanGrosze).toBe(3200000);
  });

  it("radzi sobie z brakiem ofert", () => {
    const r = calcSzkoda({ insurerValuationGrosze: 2800000, offersGrosze: [] });
    expect(r.count).toBe(0);
    expect(r.meanGrosze).toBe(0);
    expect(r.medianGrosze).toBe(0);
    expect(r.reliable).toBe(false);
  });

  it("próg miarodajności wynosi 3 oferty", () => {
    expect(MIN_OFFERS_FOR_RELIABLE).toBe(3);
  });
});
