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
3. Utwórz schemat bazy uruchamiając migracje Prisma przeciw realnej bazie
   (region UE). Wymagany jest poprawny `DIRECT_URL` (połączenie bezpośrednie):
   ```bash
   npm install
   npm run db:migrate:deploy   # stosuje prisma/migrations/0_init (i kolejne)
   npm run db:migrate:status   # weryfikacja: wszystkie migracje zastosowane
   ```
   - Migracja startowa `0_init` tworzy tabele: `orders` (z `user_id` NULL pod
     przyszłe konta), `download_tokens`, `leads`, `newsletter_subscribers`,
     `lead_magnet_tokens` oraz typy enum i indeksy.
   - Kolejne zmiany schematu twórz lokalnie przez `npm run db:migrate`
     (`prisma migrate dev`), commituj folder migracji i wdrażaj przez
     `db:migrate:deploy`.
   - Szybki prototyp bez historii migracji: `npm run db:push` (niezalecane na
     produkcji).
4. **Storage** → utwórz dwa **prywatne** buckety (bez publicznego dostępu):
   - `products` — płatne wzory pism,
   - `lead-magnets` — darmowy wzór (lead magnet).
   Nazwy bucketów są zakodowane w `src/lib/supabase/storage.ts`
   (`STORAGE_BUCKETS`). Wgraj pliki; `storageKey` produktu ustaw w Sanity, a
   klucz lead magnetu w `LEAD_MAGNET_STORAGE_KEY`. Pliki udostępniane są
   wyłącznie przez krótkotrwałe **signed URL** generowane po stronie serwera
   (klient service role) po walidacji tokenu — nigdy publicznie.
5. **Auth** → dodaj użytkownika (e-mail + hasło) właściciela panelu `/admin`.
6. **Bezpieczeństwo (WYMAGANE):**
   - `SUPABASE_SERVICE_ROLE_KEY` jest kluczem administracyjnym — trzymaj go
     wyłącznie w zmiennych serwerowych (Vercel), NIGDY z prefiksem
     `NEXT_PUBLIC_` i nie eksponuj w kodzie klienta. W repo używany jest tylko
     w modułach `server-only` (`src/lib/supabase/admin.ts`, `storage.ts`).
   - Projekt Supabase MUSI być w regionie **UE** (rezydencja danych, RODO —
     Wymaganie 11). Regionu nie da się zmienić po utworzeniu projektu.

## 3. Sanity

1. Utwórz projekt, dataset `production`.
2. Ustaw `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`.
3. Wygeneruj token do odczytu → `SANITY_API_READ_TOKEN`.
4. Ustaw sekret `SANITY_REVALIDATE_SECRET` (dowolny losowy ciąg).
5. Studio jest dostępne pod `/studio` (lub `npx sanity deploy`).
6. **Webhook** (Sanity → API): URL `https://TWOJA-DOMENA/api/revalidate`,
   dataset `production`, trigger: create/update/delete, sekret =
   `SANITY_REVALIDATE_SECRET`, projekcja: `{ "_type": _type }`.
   - Endpoint (`/api/revalidate`) weryfikuje podpis (`SANITY_REVALIDATE_SECRET`)
     i wywołuje `revalidateTag(_type)`. Tagi rewalidacji w aplikacji
     (`src/lib/content.ts`) używają **nazwy typu dokumentu** jako tagu, więc
     publikacja odświeża odpowiednie strony:
     - `article` → strona główna, listy filarów, artykuły, sitemap,
     - `product` → sklep, strony produktów, powiązania w artykułach, sitemap,
     - `legalPage` → strony prawne, sitemap,
     - `settings` → parametry kalkulatorów, cennik/link konsultacji.
   - **Uwaga (rzadki przypadek):** dokumenty `pillar` i `author` są zaciągane
     do treści artykułów przez referencje i tagowane jako `article`. Zmiana
     samego `pillar`/`author` (np. nazwy filaru lub autora) wyśle webhook z
     `_type=pillar`/`author`, dla którego nie ma dedykowanego tagu — powiązane
     artykuły odświeżą się dopiero po ich ponownej publikacji. W praktyce takie
     zmiany są sporadyczne; po edycji filaru/autora wykonaj drobną republikację
     powiązanego artykułu (lub redeploy), aby wymusić odświeżenie.
7. Uzupełnij singleton **Ustawienia** (współczynnik ekwiwalentu, minimalne
   wynagrodzenie, kod partnera, cennik konsultacji, link Cal.com).

## 4. Brevo

- `BREVO_API_KEY`, `BREVO_NEWSLETTER_LIST_ID` (id listy newslettera),
  `BREVO_SENDER_EMAIL` (zweryfikowany nadawca), `BREVO_SENDER_NAME`,
  `PARTNER_LEAD_EMAIL` (adres partnera afiliacyjnego).
- **Webhook Brevo — NIE jest wymagany w MVP.** Brevo używane jest wyłącznie
  **wychodząco** (outbound): e-maile transakcyjne (`sendTransactional`) oraz
  synchronizacja kontaktów/list (`upsertContact`, `addToList`) — patrz
  `src/lib/email/brevo.ts`. Serwis nie posiada i nie potrzebuje endpointu
  przyjmującego zdarzenia Brevo (bounce/unsubscribe) w tej wersji. Wypisy i
  twarde odbicia obsługiwane są po stronie Brevo (natywna lista + strona
  wypisu). Ewentualna przyszła synchronizacja odbić/wypisów do naszej bazy
  (`newsletter_subscribers.status`) wymagałaby dodania dedykowanego,
  weryfikowanego podpisem endpointu — celowo poza zakresem MVP, aby nie tworzyć
  niepotrzebnej powierzchni ataku.

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
  płatność **z góry** (payment before booking) — konfiguracja odbywa się w panelu
  typu wydarzenia Cal.com, nie w kodzie serwisu.
- Skopiuj pełny link rezerwacji (np. `https://cal.com/uzytkownik/konsultacja`) do
  ustawień Sanity (`calcomLink`) lub zmiennej `NEXT_PUBLIC_CALCOM_LINK`.
- Strona `/konsultacje` **osadza** (inline embed) ten link — kod tylko ładuje
  wydarzenie Cal.com; sama płatność Stripe pobierana jest po stronie Cal.com
  przed potwierdzeniem terminu. Bez skonfigurowanego linku strona pokazuje
  komunikat „dostępne wkrótce" (build przechodzi).

## 8. Plausible

- Dodaj domenę, ustaw `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (i ewentualnie
  `NEXT_PUBLIC_PLAUSIBLE_SRC`).

## 9. Vercel

1. Zaimportuj repozytorium `mrshadowsteam/kirolab`.
2. Ustaw wszystkie zmienne środowiskowe (sekcje 2–8) + `NEXT_PUBLIC_SITE_URL`.
3. Build: domyślny (`next build`); `prisma generate` uruchamia się w `postinstall`.
4. **Region funkcji serverless — UE (RODO).** Repo zawiera `vercel.json` z
   `"regions": ["fra1"]` (Frankfurt). Funkcje API przetwarzające dane osobowe
   (`/api/checkout`, `/api/lead`, `/api/webhooks/payments`,
   `/api/admin/leads/export`) uruchamiają się wtedy w UE, blisko bazy Supabase
   (rezydencja danych + niższe opóźnienia). Jeśli Twój plan/region wymaga zmiany,
   zaktualizuj `vercel.json` lub ustaw region w panelu projektu (Settings →
   Functions). Nie zmienia to hostingu treści statycznych (CDN/edge globalnie) —
   dotyczy tylko wykonywania funkcji.
5. **Domena.** Po pierwszym wdrożeniu ustaw domenę produkcyjną i zaktualizuj
   `NEXT_PUBLIC_SITE_URL` na `https://twoja-domena`, po czym wykonaj **redeploy**.
   `NEXT_PUBLIC_SITE_URL` steruje adresami kanonicznymi/OG, linkami w e-mailach
   oraz URL-ami zwrotnymi płatności (`urlReturn`) i webhookiem statusu P24
   (`urlStatus` → `/api/webhooks/payments`) — patrz `src/lib/site-config.ts`
   i `src/app/api/checkout/route.ts`. Bez aktualizacji domeny linki i webhooki
   będą wskazywać na wartość domyślną.

## 10. RODO (operacyjnie)

Finalizacja zgodności z RODO — Wymaganie 11 (11.1, 11.3, 11.4, 11.5).

### 10.1 Zgody: czas + źródło (11.1)

Każdy punkt zbierania danych osobowych wymaga wyraźnej zgody (blokada po stronie
serwera) i zapisuje ją z **czasem** oraz **źródłem/kontekstem**:

| Punkt zbierania | Tabela | Znacznik czasu zgody | Źródło / kontekst |
|---|---|---|---|
| Newsletter / „wyślij wynik na e-mail" | `newsletter_subscribers` | `consent_at` | `source` (`artykul` / `popup` / `kalkulator` / `stopka`) + double opt-in (`confirmed_at`) |
| Formularz leada `/ekspert` | `leads` | `consent_at` | kontekst: `partner_code` + parametry `utm_*` (informacja o odbiorcy pokazana przy formularzu) |
| Checkout sklepu | `orders` | `consent_at` | kontekst: samo zamówienie (produkt, `buyer_email`); zgoda = regulamin + zrzeczenie prawa odstąpienia dla treści cyfrowej |

> Zgoda w checkout jest walidowana **po stronie serwera** (`/api/checkout`), a od
> teraz również **utrwalana** w `orders.consent_at`. Kolumnę dodaje migracja
> `20250115120000_add_order_consent_at` (additywna, NULLABLE — starsze zamówienia
> zachowują NULL). Uruchom ją standardowo: `npm run db:migrate:deploy`.

### 10.2 Realizacja praw osób: dostęp i usunięcie (11.3)

Prawa realizuje **właściciel** (brak publicznego, nieuwierzytelnionego endpointu
usuwania — celowo, ze względów bezpieczeństwa). Osoby zgłaszają żądanie na adres
kontaktowy podany w **Polityce prywatności** (dokument `legalPage`
`polityka-prywatnosci` w Sanity — MUSI zawierać adres e-mail do realizacji praw
RODO). Procedura („runbook") po zgłoszeniu żądania dla adresu `X`:

1. **Weryfikacja tożsamości** wnioskodawcy (potwierdzenie, że to właściciel adresu
   `X`) — zanim udostępnisz lub usuniesz dane.
2. **Zlokalizuj dane** po adresie e-mail w Supabase (Postgres). Wyszukaj `X` w:
   - `orders` (`buyer_email`) — dane nabywcy + ewentualne dane firmy (NIP/nazwa),
   - `leads` (`email`) — dane sprawy, kontakt, UTM, kod partnera,
   - `newsletter_subscribers` (`email`) — status subskrypcji, źródło, zgody,
   - `lead_magnet_tokens` (`email`) — tokeny pobrania darmowego wzoru,
   - `download_tokens` — powiązane przez `order_id` z `orders`.
   Panel `/admin` (uwierzytelniony) pokazuje leady i pozwala je eksportować (CSV) —
   przydatne do realizacji **prawa dostępu** dla leadów. Dla pozostałych tabel użyj
   SQL Editor / Table Editor w panelu Supabase (dostęp tylko właściciel).
3. **Dostęp (eksport)**: przygotuj kopię rekordów dla `X` (CSV/JSON). Leady →
   eksport CSV z `/admin`; pozostałe → zapytanie w Supabase.
4. **Usunięcie (prawo do bycia zapomnianym)**: usuń rekordy `X` w powyższych
   tabelach. `download_tokens` znikają automatycznie przy usunięciu zamówienia
   (`ON DELETE CASCADE`).
   - **Uwaga — obowiązki księgowe**: dokumenty sprzedaży wystawione w
     **Fakturowni** podlegają ustawowemu obowiązkowi przechowywania (ewidencja
     sprzedaży) i **nie usuwa się ich** na żądanie — to prawnie uzasadniony wyjątek
     od prawa do usunięcia. Usuń dane marketingowe/kontaktowe, zachowaj wymagane
     dokumenty księgowe.
5. **Brevo**: usuń/wypisz kontakt `X` w panelu Brevo (lista newslettera + kontakty
   transakcyjne), aby usunięcie objęło również procesora e-mail.
6. **Termin**: zrealizuj żądanie bez zbędnej zwłoki, maks. **30 dni** od
   zgłoszenia; odnotuj wykonanie.

> Możliwe rozszerzenie (poza MVP): samoobsługowy, uwierzytelniony endpoint eksportu/
> usunięcia danych. Do rozważenia dopiero po dodaniu kont użytkowników — nie
> budujemy publicznego endpointu usuwania.

### 10.3 Rezydencja PII w UE — mapa danych (11.4)

Wszystkie dane osobowe przetwarzane są przez podmioty w UE/EOG (lub z odpowiednim
zabezpieczeniem). Podpisz umowę powierzenia (DPA) z każdym procesorem.

| Procesor / usługa | Dane osobowe | Region | Uwagi (DPA) |
|---|---|---|---|
| **Supabase** (Postgres + Storage) | zamówienia, leady, subskrybenci, tokeny, pliki | **UE** (np. Frankfurt) — wymóg przy tworzeniu projektu | DPA Supabase; klucz service role tylko serwerowo |
| **Brevo** | e-maile, kontakty newslettera, dane w treści maili (lead, zakup) | **UE** (Francja) | DPA Brevo; podstawa: zgoda / wykonanie umowy |
| **Fakturownia** | dane nabywcy na dokumentach sprzedaży (imię/e-mail, opcj. NIP/firma) | **PL** | DPA Fakturownia; retencja wymuszona przepisami księgowymi |
| **Plausible** | brak PII (analityka bez cookies, bez identyfikacji osób) | **UE** (Cloud EU) | brak profilowania; nie wymaga banera cookies |
| **Cal.com + Stripe** | dane rezerwacji + płatność konsultacji | procesorzy zewn. | konfiguracja i przetwarzanie po stronie Cal.com/Stripe (SCC/DPA dostawcy) |
| **Sanity** | treść (artykuły, produkty, strony prawne) — **bez PII** | CDN globalny | brak danych osobowych użytkowników |
| **Vercel** | hosting/edge; logi żądań (adresy IP) | globalny edge | DPA Vercel; logi operacyjne, nie baza PII |

### 10.4 Szyfrowanie transmisji — HTTPS (11.5)

- **HTTPS** wymuszany domyślnie przez Vercel (automatyczne certyfikaty, przekierowanie
  HTTP→HTTPS).
- **HSTS** dodany w `next.config.mjs` (`Strict-Transport-Security:
  max-age=63072000; includeSubDomains; preload`) — przeglądarki nie łączą się po
  HTTP nawet przy pierwszej próbie.
- Dodatkowe nagłówki bezpieczeństwa (globalnie): `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`.
- `NEXT_PUBLIC_SITE_URL` MUSI używać schematu **https://** (linki w e-mailach,
  webhooki, URL zwrotne płatności, canonical/OG).
- Sekrety wyłącznie w zmiennych środowiskowych Vercel; webhooki weryfikowane
  podpisem + potwierdzeniem transakcji po stronie serwera.

### 10.5 Pozostałe

- **Analityka**: Plausible (bez cookies) — brak konieczności rozbudowanego banera
  zgód. Gdyby doszło narzędzie wymagające zgody na cookies (11.3), należy dodać
  baner zgód respektujący wybór użytkownika.
- **Tokeny pobrań**: przechowywane jako hash; pliki w prywatnym buckecie, wyłącznie
  przez krótkotrwałe signed URL po walidacji tokenu.
- **Teksty prawne**: dostarcza właściciel/prawnik (edycja w Sanity — dokumenty
  `legalPage` o slugach `polityka-prywatnosci`, `regulamin-sklepu`,
  `regulamin-konsultacji`). Polityka prywatności MUSI wskazywać cel przetwarzania,
  odbiorców danych oraz sposób realizacji praw (adres kontaktowy).

## 11. Lista kontrolna przed startem

**Konfiguracja i dane**
- [ ] Wszystkie zmienne środowiskowe z `.env.example` ustawione w Vercel
      (sekcje 2–8) + `NEXT_PUBLIC_SITE_URL` = `https://` produkcyjna domena
- [ ] `db:migrate:deploy` wykonany, tabele istnieją (`db:migrate:status` = OK)
- [ ] Supabase w regionie UE; `SUPABASE_SERVICE_ROLE_KEY` tylko serwerowo
      (NIGDY z prefiksem `NEXT_PUBLIC_`)
- [ ] Buckety `products` i `lead-magnets` (prywatne) + wgrane pliki
- [ ] Użytkownik `/admin` w Supabase Auth

**Renderowanie i ISR (Wymaganie 9.2)**
- [ ] Produkcyjny `next build` przechodzi; treść renderuje się jako SSG/ISR
      (artykuły, sklep, strony prawne), API/webhooki jako dynamic
- [ ] Webhook Sanity → `/api/revalidate` działa: publikacja `article`/`product`/
      `legalPage`/`settings` odświeża odpowiednie strony (tag = `_type`)
- [ ] `sitemap.xml` i `robots.txt` dostępne

**HTTPS / bezpieczeństwo (Wymaganie 11.5)**
- [ ] Domena serwowana po **HTTPS**; przekierowanie HTTP→HTTPS działa (Vercel)
- [ ] Nagłówek `Strict-Transport-Security` (HSTS) obecny w odpowiedziach
      (zdefiniowany w `next.config.mjs`)
- [ ] `NEXT_PUBLIC_SITE_URL` używa schematu `https://`; po ustawieniu domeny
      wykonano **redeploy** (linki e-mail, canonical/OG, `urlReturn`/`urlStatus`)
- [ ] Region funkcji = UE (`vercel.json` `fra1` lub ustawienie w panelu)

**Przepływy end-to-end**
- [ ] Testowy zakup w sandboxie P24 → webhook `/api/webhooks/payments` →
      e-mail z linkiem + faktura (Fakturownia)
- [ ] Zapis newslettera → e-mail DOI → potwierdzenie → lead magnet
- [ ] Formularz `/ekspert` → lead w panelu + e-mail do partnera
- [ ] Rezerwacja konsultacji (Cal.com + Stripe)
- [ ] Strony prawne opublikowane w Sanity (polityka prywatności ze ścieżką
      realizacji praw RODO)
