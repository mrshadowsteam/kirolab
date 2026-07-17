"use client";

import dynamic from "next/dynamic";
import { CalculatorLoading } from "./calculator-loading";

/**
 * Dynamiczne (code-split) wersje kalkulatorów. JS kalkulatora nie trafia do
 * początkowego bundle'a strony — ładuje się po stronie klienta w miarę
 * potrzeby (wym. 9.4, design §1 „interaktywność wyspowa" i §10). Wspólny
 * wzorzec używany zarówno przez strony `/kalkulatory/*`, jak i przez
 * osadzenia kalkulatora w artykułach (wym. 2.4), aby nie obciążać stron
 * treściowych kodem kalkulatora.
 */

export const OdprawaCalculator = dynamic(
  () => import("./odprawa-calculator").then((m) => m.OdprawaCalculator),
  { loading: () => <CalculatorLoading />, ssr: false },
);

export const EkwiwalentCalculator = dynamic(
  () => import("./ekwiwalent-calculator").then((m) => m.EkwiwalentCalculator),
  { loading: () => <CalculatorLoading />, ssr: false },
);

export const SzkodaCalculator = dynamic(
  () => import("./szkoda-calculator").then((m) => m.SzkodaCalculator),
  { loading: () => <CalculatorLoading />, ssr: false },
);
