# Wdrożenie — Smart Obywatel

Przewodnik uruchomienia produkcyjnego na **Vercel** wraz z usługami zewnętrznymi.
Wszystkie zmienne środowiskowe: patrz [`.env.example`](.env.example).

## 1. Wymagane konta

- **Vercel** (hosting)
- **Supabase** — projekt w regionie **UE** (Postgres + Auth + Storage)
- **Sanity** (CMS)
- **Brevo** (e-mail transakcyjny + newsletter)
- **Przelewy24** (płatności; konto produkcyjne + sandbox do testów)
- **Fakturownia.pl** (dokumenty sprzedaży)
- **Cal.com** (rezerwacja konsultacji, z aplikacją Stripe do płatności)
- **Plausible** (analityka, region UE)

## 2. Supabase

1. Utwórz projekt w regionie UE (np. Frankfurt).
2. Skopiuj z ustawień: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` oraz connection stringi:
   - `DATABASE_URL` — połączenie **pooled** (port 6543, `?pgbouncer=true`),
   - `DIRECT_URL` — połączenie **direct** (port 5432).
3. Utwórz schemat bazy (bez plików migracji, MVP):
   ```bash
   npm install
   npm run db:push
   ```
   (Dla zespołu docelowo: `prisma migrate` zamiast `db:push`.)
4. **Storage** → utwórz dwa **prywatne** buckety:
   - `products` — płatne wzory pism,
   - `lead-magnets` — darmowy wzór (lead magnet).
   Wgraj pliki; `storageKey` produktu ustaw w Sanity, a klucz lead magnetu w
   `LEAD_MAGNET_STORAGE_KEY`.
5. **Auth** → dodaj użytkownika (e-mail + hasło) właściciela panelu `/admin`.

## 3. Sanity

1. Utwórz projekt, dataset `production`.
2. Ustaw `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`.
3. Wygeneruj token do odczytu → `SANITY_API_READ_TOKEN`.
4. Ustaw sekret `SANITY_REVALIDATE_SECRET` (dowolny losowy ciąg).
5. Studio jest dostępne pod `/studio` (lub `npx sanity deploy`).
6. **Webhook** (Sanity → API): URL `https://TWOJA-DOMENA/api/revalidate`,
   dataset `production`, trigger: create/update/delete, sekret =
   `SANITY_REVALIDATE_SECRET`, projekcja: `{ "_type": _type }`.
7. Uzupełnij singleton **Ustawienia** (współczynnik ekwiwalentu, minimalne
   wynagrodzenie, kod partnera, cennik konsultacji, link Cal.com).

## 4. Brevo

- `BREVO_API_KEY`, `BREVO_NEWSLETTER_LIST_ID` (id listy newslettera),
  `BREVO_SENDER_EMAIL` (zweryfikowany nadawca), `BREVO_SENDER_NAME`,
  `PARTNER_LEAD_EMAIL` (adres partnera afiliacyjnego).

## 5. Przelewy24

- `P24_MERCHANT_ID`, `P24_POS_ID`, `P24_CRC`, `P24_API_KEY`, `P24_SANDBOX`
  (`true` do testów, `false` na produkcji).
- Webhook (`urlStatus`) przekazywany jest automatycznie przy każdej transakcji
  i wskazuje na `/api/webhooks/payments`. Upewnij się, że `NEXT_PUBLIC_SITE_URL`
  wskazuje na produkcyjną domenę.
- **Przetestuj w sandboxie** pełny przepływ zakupu przed produkcją.

## 6. Fakturownia

- `FAKTUROWNIA_DOMAIN`, `FAKTUROWNIA_API_TOKEN`.
- `FAKTUROWNIA_INVOICE_KIND` = `bill` (rachunek, dla nie-VAT); po przejściu na
  JDG/VAT zmień na `vat`. `FAKTUROWNIA_TAX` = `disabled` lub stawka (np. `23`).
- `FAKTUROWNIA_SELLER_NAME` — nazwa sprzedawcy.

## 7. Cal.com + Stripe

- Utwórz typ wydarzenia (konsultacja), podłącz aplikację **Stripe** i ustaw
  płatność **z góry**. Skopiuj link rezerwacji do ustawień Sanity (`calcomLink`)
  lub `NEXT_PUBLIC_CALCOM_LINK`.

## 8. Plausible

- Dodaj domenę, ustaw `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (i ewentualnie
  `NEXT_PUBLIC_PLAUSIBLE_SRC`).

## 9. Vercel

1. Zaimportuj repozytorium `mrshadowsteam/kirolab`.
2. Ustaw wszystkie zmienne środowiskowe (sekcje 2–8) + `NEXT_PUBLIC_SITE_URL`.
3. Build: domyślny (`next build`); `prisma generate` uruchamia się w `postinstall`.
4. Po pierwszym wdrożeniu ustaw domenę produkcyjną i zaktualizuj
   `NEXT_PUBLIC_SITE_URL`, po czym wykonaj redeploy.

## 10. RODO (operacyjnie)

- **Zgody**: zapisywane z czasem (`consentAt`) i źródłem (newsletter, lead).
- **Analityka**: Plausible (bez cookies) — brak konieczności rozbudowanego
  banera zgód.
- **Prawa osób** (dostęp/usunięcie): realizowane przez właściciela —
  dane leadów/subskrybentów/zamówień w Supabase (usuwanie rekordów),
  a kontaktów newsletterowych również w Brevo (wypis/usuwanie).
- **Szyfrowanie**: HTTPS wymuszany przez Vercel; sekrety w zmiennych środowiskowych.
- **Region danych**: Supabase i Plausible w UE.
- **Teksty prawne**: dostarcza właściciel/prawnik (edycja w Sanity — dokumenty
  `legalPage` o slugach `polityka-prywatnosci`, `regulamin-sklepu`,
  `regulamin-konsultacji`).

## 11. Lista kontrolna przed startem

- [ ] `db:push` wykonany, tabele istnieją
- [ ] Buckety `products` i `lead-magnets` (prywatne) + wgrane pliki
- [ ] Użytkownik `/admin` w Supabase Auth
- [ ] Webhook Sanity → `/api/revalidate` działa (publikacja odświeża treść)
- [ ] Testowy zakup w sandboxie P24 → e-mail z linkiem + faktura
- [ ] Zapis newslettera → e-mail DOI → potwierdzenie → lead magnet
- [ ] Formularz `/ekspert` → lead w panelu + e-mail do partnera
- [ ] Rezerwacja konsultacji (Cal.com + Stripe)
- [ ] Strony prawne opublikowane w Sanity
- [ ] `sitemap.xml` i `robots.txt` dostępne
