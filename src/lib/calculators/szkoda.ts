/**
 * Kalkulator porównawczy zaniżenia szkody całkowitej.
 * Użytkownik podaje wycenę ubezpieczyciela oraz oferty rynkowe podobnych aut.
 * Liczymy medianę i średnią ofert oraz różnicę względem wyceny ubezpieczyciela.
 */

export const MIN_OFFERS_FOR_RELIABLE = 3;

export interface SzkodaInput {
  insurerValuationGrosze: number;
  offersGrosze: number[];
}

export interface SzkodaResult {
  count: number;
  meanGrosze: number;
  medianGrosze: number;
  /** Różnica: mediana − wycena ubezpieczyciela (dodatnia = zaniżenie). */
  diffFromMedianGrosze: number;
  diffFromMeanGrosze: number;
  reliable: boolean;
}

function median(sortedAsc: number[]): number {
  const n = sortedAsc.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  if (n % 2 === 1) return sortedAsc[mid];
  return Math.round((sortedAsc[mid - 1] + sortedAsc[mid]) / 2);
}

export function calcSzkoda(input: SzkodaInput): SzkodaResult {
  const offers = input.offersGrosze
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
  const count = offers.length;

  const mean =
    count > 0
      ? Math.round(offers.reduce((sum, v) => sum + v, 0) / count)
      : 0;
  const med = median(offers);

  return {
    count,
    meanGrosze: mean,
    medianGrosze: med,
    diffFromMedianGrosze: med - input.insurerValuationGrosze,
    diffFromMeanGrosze: mean - input.insurerValuationGrosze,
    reliable: count >= MIN_OFFERS_FOR_RELIABLE,
  };
}
