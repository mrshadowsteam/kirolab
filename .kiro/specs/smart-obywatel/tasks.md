# Plan implementacji — Smart Obywatel

> Zadania w kolejności zależności. Każde odnosi się do wymagań z `requirements.md`.
> Realizacja przyrostowa — kolejne fazy bazują na fundamentach z wcześniejszych.
> Zgodnie z ustaleniami: testów automatycznych nie dodajemy domyślnie (do decyzji
> osobno). Zatwierdzony stack i decyzje: patrz `design.md` §2, §14.

## Faza 0 — Fundamenty projektu

- [x] 1. Inicjalizacja projektu Next.js (App Router) + TypeScript na strukturze pod Vercel
  - konfiguracja ESLint/Prettier, ścieżki alias, struktura katalogów (`app/`, `lib/`, `components/`)
  - `next/font` z self-hostem **Fraunces** (nagłówki) i **Inter** (tekst)
  - _Wymagania: 9.2, 9.5, 10.2_

- [x] 2. System wizualny: Tailwind + shadcn/ui (Radix)
  - tokeny kolorów (teal `#0F766E`, bursztyn `#F59E0B`, grafit `#1F2937`, tło `#FBFAF7`, itd.)
  - reguła kontrastu bursztynu (fill + ciemny tekst; link amber-700 `#B45309`)
  - kolory filarów (Kariera / Prawo Pracy / Prawa Konsumenta), komponenty bazowe (Button, Card, Badge, Input, Dialog)
  - _Wymagania: 12.1, 12.2_

- [x] 3. Globalny layout, nawigacja mobile-first i stopka
  - responsywna nawigacja do wszystkich głównych sekcji
  - stopka z linkami do stron prawnych i disclaimerem „to nie jest porada prawna"
  - _Wymagania: 1.5, 8.3, 8.4, 12.3_

- [x] 4. Integracja Plausible Cloud (EU) jako komponent skryptu przełączany env
  - _Wymagania: 11.2_

## Faza 1 — Treść (Sanity)

- [x] 5. Konfiguracja projektu Sanity + osadzenie Studio, klient `next-sanity` + GROQ
  - _Wymagania: 2.8_

- [x] 6. Schematy CMS: `pillar`, `author`, `article`, `product`, `legalPage`
  - pola SEO (metaTitle/description/ogImage), `relatedProducts`, `relatedCalculator`, `previewContent`, `storageKey`
  - _Wymagania: 2.1–2.5, 4.1, 4.2, 8.1, 8.2_

- [x] 7. Singleton `settings` (edytowalny przez właściciela)
  - `equivalentCoefficient`, `minimumWage`, `defaultPartnerCode`, `newsletterPopupCooldownDays`, `consultationOffer`
  - _Wymagania: 3.10, 3.11, 5.5_

## Faza 2 — Dane i storage (Supabase)

- [x] 8. Konfiguracja Supabase (region EU): Postgres + Auth + Storage; Prisma + migracje
  - schematy: `orders` (z `user_id` null pod przyszłe konta), `download_tokens`, `leads`, `newsletter_subscribers`, `lead_magnet_tokens`
  - prywatne buckety storage na pliki produktów i lead magnetu
  - _Wymagania: 4.13, 5.8, 11.6, 13.1, 13.2_

## Faza 3 — Warstwy integracji (adaptery)

- [x] 9. `EmailService` (Brevo): `sendTransactional`, `upsertContact`, `addToList`
  - _Wymagania: 4.5, 5.6, 7.7_

- [x] 10. `PaymentProvider` (interfejs) + implementacja `Przelewy24Provider`
  - `createPayment`, `verifyWebhook` (podpis), `confirmTransaction` (potwierdzenie server-side)
  - _Wymagania: 4.3, 4.4_

- [x] 11. `InvoiceService` (Fakturownia): auto-dokument, dane firmy z checkout, konfiguracja sprzedawcy (os. prywatna → JDG)
  - _Wymagania: 4.8, 4.9, 4.10, 4.11_

## Faza 4 — Strony treściowe

- [x] 12. Strona główna: 3 filary, najnowsze case studies, wyróżnione produkty, CTA newslettera, structured data `Organization`/`WebSite`
  - _Wymagania: 1.1–1.6_

- [x] 13. Blog: lista artykułów w filarze z filtrem kategorii
  - _Wymagania: 2.7_

- [x] 14. Strona artykułu: treść z semantycznymi nagłówkami, powiązane produkty/kalkulator, `Article` JSON-LD, osadzone CTA newslettera, disclaimer
  - _Wymagania: 2.1–2.6, 2.9_

## Faza 5 — Kalkulatory

- [x] 15. Wspólny szkielet kalkulatorów (obliczenia client-side, walidacja, disclaimer, „wyślij wynik na e-mail" z zgodą RODO → przepływ newslettera)
  - ładowanie dynamiczne (`next/dynamic`)
  - _Wymagania: 3.1–3.6, 10.2_

- [x] 16. Kalkulator odprawy (model 1/2/3 wg stażu, limit 15× min. wynagrodzenia z `settings`, wyjaśnienie w UI: 20+ osób / przyczyny niedotyczące pracownika)
  - _Wymagania: 3.7, 3.8, 3.9_

- [x] 17. Kalkulator ekwiwalentu za urlop (współczynnik z `settings`)
  - _Wymagania: 3.10, 3.11_

- [x] 18. Kalkulator zaniżenia szkody całkowitej (mediana/średnia z ofert, różnica do wyceny, komunikat przy zbyt małej liczbie ofert, link do powiązanego wzoru w sklepie)
  - _Wymagania: 3.12, 3.13, 3.14_

## Faza 6 — Sklep i dostawa cyfrowa

- [x] 19. Katalog sklepu + strona produktu z podglądem fragmentu, `Product`/`Offer` JSON-LD
  - _Wymagania: 4.1, 4.2, 4.12_

- [x] 20. Checkout: dane kupującego + opcjonalne „Chcę fakturę na firmę" (NIP/nazwa, walidacja), inicjacja płatności Przelewy24
  - _Wymagania: 4.3, 4.9, 4.10_

- [x] 21. Webhook płatności: weryfikacja podpisu + potwierdzenie transakcji, `order` → paid, generacja `download_token` (72h/3), auto-faktura, e-mail z linkiem
  - _Wymagania: 4.4, 4.5, 4.8_

- [x] 22. Endpoint pobrania `/pobierz/[token]`: walidacja ważności i limitu → signed URL; przy wygaśnięciu/limicie „wyślij ponownie" (regeneracja + ponowny e-mail)
  - _Wymagania: 4.6, 4.7, 11.6_

## Faza 7 — Newsletter i lead magnet

- [x] 23. Zapis newslettera z wielu miejsc (artykuł, stopka, wynik kalkulatora) z zgodą RODO + double opt-in (token potwierdzający, e-mail DOI, sync do Brevo)
  - _Wymagania: 7.1, 7.2, 7.6, 7.7, 11.1_

- [x] 24. Wydanie lead magnetu po potwierdzeniu: strona bezpośredniego pobrania + link w mailu (30 dni, bez limitu), osobny `lead_magnet_token` (nie reużywa tokenów sklepu)
  - _Wymagania: 7.3, 7.4_

- [x] 25. Pop-up newslettera z ograniczeniem częstotliwości (cooldown z `settings`, pamięć lokalna, respektowanie zamknięcia/zapisu), ładowany dynamicznie
  - _Wymagania: 7.5, 7.6, 9.4_

## Faza 8 — Lead afiliacyjny i panel

- [x] 26. Formularz „Porozmawiaj z ekspertem": pola sprawy/kontaktu, zgoda RODO + info o odbiorcy, odczyt UTM i `partner_code` (fallback z `settings`), zapis leada, auto e-mail do partnera, potwierdzenie
  - _Wymagania: 5.1–5.8, 11.1_

- [x] 27. Panel `/admin` (Supabase Auth): lista leadów z danymi/UTM/kodem partnera, zmiana statusu, filtr, **eksport CSV**
  - _Wymagania: 5.9, 5.10, 5.11_

## Faza 9 — Konsultacje

- [x] 28. Strona konsultacji: opis oferty + cennik z `settings`, embed Cal.com Cloud + Stripe (płatność przed rezerwacją), meta dane, disclaimer jeśli wymagany
  - _Wymagania: 6.1–6.5_

## Faza 10 — Strony prawne, SEO, jakość

- [x] 29. Strony prawne z CMS (polityka prywatności, regulamin sklepu, regulamin konsultacji) + disclaimer w stopce treści prawnych/kalkulatorów
  - _Wymagania: 8.1–8.4_

- [x] 30. SEO globalne: `generateMetadata` per strona, OG/Twitter Card, dynamiczny `sitemap.xml`, `robots.txt`, czyste URL-e
  - _Wymagania: 10.1, 10.3, 10.4, 10.5_

- [x] 31. Audyt dostępności (WCAG 2.1 AA / EAA): kontrast, nawigacja klawiaturą, focus, etykiety/komunikaty formularzy, czytniki ekranu
  - _Wymagania: 12.2_

- [x] 32. Audyt wydajności mobilnej (Core Web Vitals): obrazy `next/image`, budżet JS, dynamiczne ładowanie kalkulatorów/pop-upu, ISR treści
  - _Wymagania: 9.1, 9.2, 9.3, 9.4_

## Faza 11 — RODO i wdrożenie

- [x] 33. Finalizacja RODO: zapisywanie zgód (czas + źródło), ścieżka realizacji praw (dostęp/usunięcie), przegląd przechowywania PII w UE, HTTPS
  - _Wymagania: 11.1, 11.3, 11.4, 11.5_

- [x] 34. Wdrożenie na Vercel: zmienne środowiskowe/sekrety, webhooki (Przelewy24, Brevo), rewalidacja ISR z Sanity, konfiguracja domeny
  - _Wymagania: 9.2, 11.5_
