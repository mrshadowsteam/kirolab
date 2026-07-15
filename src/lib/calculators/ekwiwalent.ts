/**
 * Kalkulator ekwiwalentu za niewykorzystany urlop (pełny etat).
 * Ekwiwalent = liczba dni × (podstawa miesięczna / współczynnik ekwiwalentu).
 * Współczynnik jest edytowalny w CMS (settings.equivalentCoefficient).
 */

/** Domyślny współczynnik — nadpisywany wartością z CMS. Zaktualizuj na dany rok. */
export const DEFAULT_EQUIVALENT_COEFFICIENT = 21.14;

export interface EkwiwalentInput {
  unusedDays: number;
  monthlyBaseGrosze: number;
  coefficient: number;
}

export interface EkwiwalentResult {
  amountGrosze: number;
  dailyRateGrosze: number;
}

export function calcEkwiwalent(input: EkwiwalentInput): EkwiwalentResult {
  if (input.coefficient <= 0) {
    return { amountGrosze: 0, dailyRateGrosze: 0 };
  }
  const dailyRate = input.monthlyBaseGrosze / input.coefficient;
  return {
    dailyRateGrosze: Math.round(dailyRate),
    amountGrosze: Math.round(dailyRate * input.unusedDays),
  };
}
