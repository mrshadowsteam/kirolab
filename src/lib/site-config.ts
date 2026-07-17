/** Centralna konfiguracja marki, nawigacji i filarów. */

export const siteConfig = {
  name: "Smart Obywatel",
  tagline: "Konkretna pomoc w prawie pracy, prawach konsumenta i karierze.",
  description:
    "Smart Obywatel — artykuły, darmowe kalkulatory i gotowe wzory pism. Rozwiąż sprawę z pracodawcą lub ubezpieczycielem i przygotuj się do trudnej rekrutacji.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://smartobywatel.pl",
} as const;

export type PillarSlug = "kariera" | "prawo-pracy" | "prawa-konsumenta";

export interface Pillar {
  slug: PillarSlug;
  title: string;
  shortTitle: string;
  description: string;
  /** Klasa koloru odznaki (Tailwind). */
  colorClass: string;
}

export const pillars: Pillar[] = [
  {
    slug: "kariera",
    title: "Kariera",
    shortTitle: "Kariera",
    description:
      "Przygotowanie do rozmów kwalifikacyjnych i negocjacji podwyżki — konkretnie i bez lania wody.",
    colorClass: "bg-pillar-kariera",
  },
  {
    slug: "prawo-pracy",
    title: "Prawo Pracy",
    shortTitle: "Prawo Pracy",
    description:
      "Twoje prawa w sporze z pracodawcą — odprawy, urlopy, zgłoszenia do PIP.",
    colorClass: "bg-pillar-prawo-pracy",
  },
  {
    slug: "prawa-konsumenta",
    title: "Prawa Konsumenta",
    shortTitle: "Konsument",
    description:
      "Reklamacje, odszkodowania i spory z ubezpieczycielem — wiedza i gotowe pisma.",
    colorClass: "bg-pillar-prawa-konsumenta",
  },
];

export const mainNav = [
  { title: "Kariera", href: "/kariera" },
  { title: "Prawo Pracy", href: "/prawo-pracy" },
  { title: "Prawa Konsumenta", href: "/prawa-konsumenta" },
  { title: "Kalkulatory", href: "/kalkulatory" },
  { title: "Sklep", href: "/sklep" },
  { title: "Konsultacje", href: "/konsultacje" },
  { title: "Ekspert", href: "/ekspert" },
];

export const legalNav = [
  { title: "Polityka prywatności", href: "/polityka-prywatnosci" },
  { title: "Regulamin sklepu", href: "/regulamin-sklepu" },
  { title: "Regulamin konsultacji", href: "/regulamin-konsultacji" },
];

/** Disclaimer wyświetlany w stopce treści prawnych i przy kalkulatorach. */
export const legalDisclaimer =
  "Treści i wyniki kalkulatorów mają charakter wyłącznie informacyjny i szacunkowy. To nie jest porada prawna.";
