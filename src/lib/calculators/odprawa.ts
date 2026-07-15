/**
 * Kalkulator odprawy (zwolnienia z przyczyn niedotyczących pracownika,
 * pracodawca 20+ osób). Model: staż < 2 lata = 1 pensja, 2–8 lat = 2 pensje,
 * > 8 lat = 3 pensje. Limit: 15× minimalnego wynagrodzenia.
 */

/** Domyślne min. wynagrodzenie w groszach — nadpisywane wartością z CMS (settings). */
export const DEFAULT_MINIMUM_WAGE_GROSZE = 466600;

export interface OdprawaInput {
  yearsOfService: number;
  monthlyWageGrosze: number;
  minimumWageGrosze: number;
}

export interface OdprawaResult {
  months: 1 | 2 | 3;
  amountGrosze: number;
  capGrosze: number;
  capped: boolean;
}

/** Liczba miesięcznych wynagrodzeń wg stażu (w pełnych latach). */
export function severanceMonths(years: number): 1 | 2 | 3 {
  if (years < 2) return 1;
  if (years <= 8) return 2;
  return 3;
}

export function calcOdprawa(input: OdprawaInput): OdprawaResult {
  const months = severanceMonths(input.yearsOfService);
  const raw = months * input.monthlyWageGrosze;
  const capGrosze = 15 * input.minimumWageGrosze;
  const capped = raw > capGrosze;
  return {
    months,
    amountGrosze: capped ? capGrosze : raw,
    capGrosze,
    capped,
  };
}
