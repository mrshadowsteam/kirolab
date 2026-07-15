# Test zakupu end-to-end (Przelewy24 — sandbox)

Checklista realnego testu w przeglądarce (nie tylko testów jednostkowych).
Sprawdza redirecty, sesję/dostęp bez konta oraz stan zamówienia w bazie na
każdym etapie.

## ⚠️ Warunek krytyczny: webhook musi być publicznie osiągalny

Płatność potwierdza **webhook serwer-serwer** (`/api/webhooks/payments`), który
P24 wywołuje ze swoich serwerów. **Na `localhost` ten webhook nie dotrze** →
zamówienie zostanie w stanie `pending`, nie powstanie token ani e-mail.

Wybierz jedno:
- **Deploy na Vercel (preview/prod)** i ustaw `NEXT_PUBLIC_SITE_URL` na ten adres, **albo**
- **tunel** (np. `ngrok http 3000`) i ustaw `NEXT_PUBLIC_SITE_URL` na URL z ngrok.

`NEXT_PUBLIC_SITE_URL` jest używany do budowy `urlReturn` i `urlStatus`, więc
musi wskazywać publiczny adres, pod którym działa aplikacja.

## Przygotowanie

- [ ] `P24_SANDBOX=true` + **sandboxowe** `P24_MERCHANT_ID / P24_POS_ID / P24_CRC / P24_API_KEY`
      (CRC sandbox różni się od produkcyjnego!).
- [ ] `DATABASE_URL` / `DIRECT_URL` do Supabase; tabele utworzone (`npm run db:push`).
- [ ] W Sanity istnieje **produkt** z ceną (`priceGrosze`) i `storageKey`
      wskazującym na **realny plik** w prywatnym buckecie `products`.
- [ ] `BREVO_API_KEY` + zweryfikowany nadawca (żeby dotarł e-mail z linkiem).
- [ ] (Opcjonalnie) Fakturownia — jeśli nieskonfigurowana, faktura się nie wystawi,
      ale realizacja i tak przejdzie (błąd faktury jest logowany, nie blokuje).

## Podgląd stanu w bazie (Supabase → SQL editor)

```sql
select id, status, amount_grosze, payment_ref, invoice_id, paid_at, created_at
from orders order by created_at desc limit 10;

select order_id, expires_at, max_downloads, download_count, created_at
from download_tokens order by created_at desc limit 10;
```

## Etapy i co sprawdzić

### 1. Checkout (`/sklep/{slug}/zamowienie`)
- [ ] Wypełnij e-mail; opcjonalnie „Chcę fakturę na firmę" + NIP (10 cyfr).
- [ ] Po „Przejdź do płatności" następuje redirect na stronę P24.
- **DB:** nowy wiersz `orders` ze statusem **`pending`**, `amount_grosze` = cena z
  Sanity × 100 (⚠️ cena bierze się z serwera, nie z klienta), `payment_ref`
  uzupełniony (token P24).

### 2. Płatność na P24 (sandbox)
- [ ] Zapłać metodą sandbox (testowy BLIK / testowa karta wg dokumentacji P24).
- [ ] Po płatności następuje powrót na `urlReturn` → `/sklep/{slug}/dziekujemy`.
- Uwaga: strona „dziękujemy" pokazuje się **niezależnie** od webhooka — sama nie
  oznacza, że płatność potwierdzona. Potwierdzeniem jest webhook (etap 3).

### 3. Webhook (asynchronicznie, serwer-serwer)
- [ ] W logach aplikacji widać `POST /api/webhooks/payments` (200).
- [ ] Podpis przeszedł weryfikację (przy błędnym → 401, zamówienie zostaje `pending`).
- **DB:** `orders.status` = **`paid`**, `paid_at` ustawione, `invoice_id`
  uzupełnione (jeśli Fakturownia działa); powstał wiersz w `download_tokens`
  (`max_downloads` = 3, `expires_at` = +72 h).
- [ ] Na e-mail kupującego dotarła wiadomość z linkiem do pobrania.

### 4. Pobranie pliku
- [ ] Link z e-maila → `/pobierz/{token}` → „Pobierz dokument" →
      `/api/pobierz/{token}` przekierowuje do krótkotrwałego signed URL i plik się pobiera.
- **DB:** `download_count` rośnie o 1 przy każdym pobraniu.
- [ ] Po 3 pobraniach lub po 72 h strona statusu pokazuje „link wygasł" +
      opcję „wyślij ponownie" (regeneracja tokenu + nowy e-mail).

### 5. Idempotencja (P24 może wysłać webhook kilka razy)
- [ ] Powtórne wywołanie webhooka dla opłaconego zamówienia **nie** tworzy
      drugiego tokenu, nie wysyła kolejnego e-maila, nie dubluje faktury
      (handler zwraca `alreadyProcessed`).

### 6. Płatność przerwana / anulowana
- [ ] Anuluj płatność na P24 → brak webhooka potwierdzającego.
- **DB:** zamówienie zostaje **`pending`** (brak tokenu, brak e-maila). Nic nie
  zostaje omyłkowo oznaczone jako opłacone.

## Dostęp bez konta (MVP)
- [ ] Jedyny dostęp do pliku to link z e-maila (token). Brak logowania —
      potwierdź, że bez tokenu nie da się pobrać pliku.

## Najczęstsze pułapki
- Webhook nieosiągalny publicznie → zamówienie utknie w `pending` (patrz sekcja
  krytyczna na górze).
- CRC sandbox ≠ produkcyjny → błędny podpis → 401 na webhooku.
- `NEXT_PUBLIC_SITE_URL` inny niż faktyczny adres → złe `urlReturn`/`urlStatus`.
- Kwoty w **groszach** po obu stronach (u nas i w P24) — zgodność `amount_grosze`.
