# Smart Obywatel

Portal edukacyjno-narzędziowy z zakresu prawa pracy, praw konsumenta i kariery
zawodowej, powiązany z kanałem wideo (Shorts/Reels). Mobile-first, SEO-first,
zgodny z RODO.

Specyfikacja projektu: [`.kiro/specs/smart-obywatel`](.kiro/specs/smart-obywatel)
(`requirements.md`, `design.md`, `tasks.md`).

## Stack

- **Next.js (App Router) + TypeScript** — hosting na Vercel
- **Tailwind CSS + shadcn/ui (Radix)** — system wizualny, dostępność WCAG AA
- **Sanity** — treść (artykuły, produkty, strony prawne, ustawienia)
- **Supabase** (Postgres + Auth + Storage, region EU) — dane transakcyjne/PII
- **Przelewy24** — płatności (adapter `PaymentProvider`, na przyszłość Tpay)
- **Fakturownia** — automatyczne dokumenty sprzedaży
- **Brevo** — e-mail transakcyjny + newsletter (double opt-in)
- **Cal.com + Stripe** — rezerwacja konsultacji 1:1
- **Plausible (EU)** — analityka privacy-first (bez banera cookies)

## Uruchomienie lokalne

> Wymaga dostępu do rejestru npm (środowisko chmurowe Kiro ma zablokowaną sieć —
> instalację i build wykonuje się lokalnie lub w GitHub Actions).

```bash
npm install
cp .env.example .env.local   # uzupełnij wartości
npm run dev                  # http://localhost:3000
```

Skrypty:

- `npm run dev` — serwer developerski
- `npm run build` / `npm run start` — build produkcyjny
- `npm run typecheck` — sprawdzenie typów
- `npm run lint` — ESLint

## Struktura

```
src/
  app/            # trasy App Router
  components/
    layout/       # nagłówek, stopka
    ui/           # komponenty bazowe (button, badge, ...)
    analytics/    # Plausible
  lib/            # utils, konfiguracja marki
.kiro/specs/      # requirements / design / tasks
.github/workflows # CI (typecheck + lint + build)
```

## Status

Realizacja przyrostowa według `tasks.md`:

- **Faza 0 — fundamenty** ✅ projekt, system wizualny (Tailwind/shadcn, paleta,
  Fraunces+Inter), layout mobile-first ze stopką i disclaimerem, Plausible, CI.
- **Faza 1 — Sanity** ✅ osadzone Studio (`/studio`), schematy (`pillar`, `author`,
  `article`, `product`, `legalPage`), singleton `settings`, klient + zapytania
  GROQ, webhook rewalidacji ISR.

> Weryfikacja buildu odbywa się w GitHub Actions (środowisko Kiro ma zablokowany
> rejestr npm). Kolejny krok: Faza 2 — Supabase (Prisma, Auth, Storage).
