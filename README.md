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
- **Faza 2 — Supabase** ✅ schema Prisma (`Order`, `DownloadToken`, `Lead`,
  `NewsletterSubscriber`, `LeadMagnetToken`), klienci Supabase (admin/service-role,
  browser, server SSR), helper podpisanych URL-i do prywatnych bucketów Storage.
- **Faza 3 — Adaptery integracji** ✅ `EmailService` (Brevo: e-maile transakcyjne
  + kontakty), `PaymentProvider` (interfejs + `Przelewy24Provider`, fabryka wg
  `PAYMENT_PROVIDER`), `InvoiceService` (Fakturownia: auto-dokument, dane firmy,
  typ dokumentu z konfiguracji).
- **Faza 4 — Strony treściowe** ✅ pełna strona główna (3 filary, case studies,
  wyróżnione produkty, CTA newslettera, JSON-LD Organization/WebSite), listy
  artykułów per filar (`/[pillar]`), strona artykułu (`/[pillar]/[slug]`) z
  Portable Text, powiązanymi produktami/kalkulatorem, disclaimerem i JSON-LD
  Article. Odporne ładowanie z Sanity (fallback przy braku konfiguracji).
- **Faza 5 — Kalkulatory** ✅ 3 kalkulatory (odprawa z limitem 15×, ekwiwalent za
  urlop ze współczynnikiem z CMS, porównawczy szkody całkowitej) — obliczenia po
  stronie klienta, walidacja, disclaimer, „wyślij wynik na e-mail" (double opt-in
  przez `/api/newsletter/subscribe`). Parametry prawne z Sanity settings (fallback
  do stałych).

- **Faza 6 — Sklep i dostawa cyfrowa** ✅ katalog (`/sklep`), strona produktu z
  podglądem fragmentu i JSON-LD Product/Offer, checkout (e-mail + opcjonalna
  faktura firmowa z NIP), `/api/checkout` (Order pending + Przelewy24), webhook
  `/api/webhooks/payments` (weryfikacja podpisu + potwierdzenie transakcji →
  Order paid + token pobrania + auto-faktura Fakturownia + e-mail Brevo), strona
  statusu `/pobierz/[token]`, endpoint pobrania (72h / 3 pobrania, signed URL) i
  „wyślij ponownie".

- **Faza 7 — Newsletter i lead magnet** ✅ funkcjonalny zapis (double opt-in) z
  CTA i pop-upu (cooldown w localStorage, ukryty na /studio, /admin itd.), strona
  potwierdzenia `/newsletter/potwierdz` (status → confirmed, sync do Brevo,
  wydanie lead magnetu), pobranie darmowego wzoru `/api/pobierz-wzor/[token]`
  (30 dni, bez limitu — osobny mechanizm od tokenów sklepu).

- **Faza 8 — Lead afiliacyjny i panel** ✅ formularz `/ekspert` (rodzaj sprawy,
  opis, kontakt, zgoda RODO, odczyt UTM + kodu partnera z URL), `/api/lead`
  (zapis + auto-przekazanie e-mailem partnerowi, fallback kodu partnera), panel
  `/admin` chroniony Supabase Auth (`/admin/login`) z listą leadów, zmianą
  statusu, filtrem i eksportem CSV.

- **Faza 9 — Konsultacje 1:1** ✅ strona `/konsultacje` z opisem oferty i cennikiem
  z CMS oraz linkiem rezerwacji Cal.com (płatność z góry po stronie Cal.com/Stripe).

- **Faza 10 — Strony prawne i SEO** ✅ strony prawne z CMS (`/polityka-prywatnosci`,
  `/regulamin-sklepu`, `/regulamin-konsultacji`) z fallbackiem, dynamiczny
  `sitemap.xml` (trasy statyczne + artykuły + produkty), `robots.txt` (blokada
  `/admin`, `/studio`, `/api`, linków pobrań), `theme-color`. Dostępność (WCAG AA)
  i wydajność (SSG/ISR, `next/image`, dynamiczne ładowanie) wbudowane od Fazy 0.
- **Faza 11 — RODO i wdrożenie** ✅ przewodnik [`DEPLOYMENT.md`](DEPLOYMENT.md)
  (konfiguracja usług, `db:push`, buckety, webhooki, lista kontrolna), operacyjne
  RODO (zgody z czasem/źródłem, prawa osób, region UE, HTTPS), `viewport`/theme-color.

> Weryfikacja buildu odbywa się w GitHub Actions (środowisko Kiro ma zablokowany
> rejestr npm). Wdrożenie krok po kroku: patrz `DEPLOYMENT.md`.

## Wszystkie fazy ukończone ✅

Implementacja MVP zgodna ze specyfikacją (`.kiro/specs/smart-obywatel`) jest
kompletna. Aby uruchomić produkcyjnie, wykonaj kroki z `DEPLOYMENT.md`.
