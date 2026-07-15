# Wymagania — Smart Obywatel

## Wprowadzenie

Smart Obywatel to polski portal edukacyjno-narzędziowy z zakresu prawa pracy, praw
konsumenta i kariery zawodowej, powiązany z kanałem wideo (Shorts/Reels). Celem
serwisu jest przekształcenie widza krótkiego wideo w:
- czytelnika rozwiniętego artykułu,
- użytkownika darmowego kalkulatora,
- kupującego gotowy wzór dokumentu,
- leada afiliacyjnego przekazanego do partnerskiej kancelarii,
- klienta płatnej konsultacji 1:1,
- subskrybenta newslettera.

Serwis jest w języku polskim, **mobile-first** (większość ruchu z linków w bio
TikTok/Instagram/YouTube Shorts), zoptymalizowany pod **SEO** i zgodny z **RODO**.
MVP **nie zawiera kont użytkowników z logowaniem** — zakupy obsługiwane są przez
e-mail + link do pobrania, z zachowaniem możliwości łatwej rozbudowy o konta.

### Ustalenia produktowe (przyjęte założenia)

| Obszar | Decyzja |
|---|---|
| Status prawny | Osoba prywatna / działalność nierejestrowana → docelowo JDG (zmiana ma być kwestią konfiguracji, nie kodu) |
| Płatności | Przelewy24 **lub** Tpay (BLIK, karta, przelew); waluta wyłącznie PLN |
| Faktury / rachunki | Fakturownia.pl przez API (bez własnego modułu fakturowania) |
| Dostawa produktów cyfrowych | Własny lekki mechanizm: webhook płatności → token pobrania → e-mail z linkiem ważnym 72 h, max 3 pobrania, opcja „wyślij ponownie" |
| Treści blogowe | Headless CMS: **Sanity** (autor dodaje treści bez developera) |
| Lead afiliacyjny | Zapis w bazie + automatyczne przekazanie e-mailem do partnera; przy każdym leadzie zapisywane UTM i kod partnera |
| Konsultacje 1:1 | **Cal.com** zintegrowany ze **Stripe**, płatność przed rezerwacją |
| Newsletter | **Double opt-in** |
| E-maile (newsletter + transakcyjne) | **Brevo** (jedno narzędzie) |
| Analityka | Privacy-first: **Umami** lub **Plausible** (nie GA4 na start) |
| Teksty prawne | Dostarcza właściciel / prawnik; serwis je wyłącznie osadza |
| Branding | System wizualny do zaproponowania w `design.md` |
| Hosting | **Vercel** |

### Słownik pojęć

- **Filar** — jeden z trzech obszarów tematycznych: Kariera / Prawo Pracy / Prawa Konsumenta.
- **Case study** — artykuł rozwijający temat konkretnego wideo.
- **Szablon / wzór** — cyfrowy produkt (PDF/DOCX) do samodzielnego wypełnienia.
- **Lead afiliacyjny** — kontakt użytkownika przekazany partnerowi (kancelaria/firma odszkodowawcza).
- **Kod partnera** — identyfikator źródła leada, obok danych UTM.
- **Disclaimer** — informacja „wynik szacunkowy, to nie jest porada prawna".

### Format kryteriów akceptacji

Kryteria zapisano w notacji EARS (spolszczonej): `GDY / JEŚLI / PODCZAS GDY [warunek],
system MUSI [reakcja]`. „MUSI" oznacza wymaganie obligatoryjne dla MVP; „POWINIEN"
oznacza wymaganie pożądane, ale niekonieczne dla MVP.

---

## Wymaganie 1 — Strona główna

**Historia użytkownika:** Jako widz przychodzący z linku w bio, chcę od razu
zrozumieć, czym jest serwis i gdzie znajdę pomoc w mojej sprawie, aby szybko
przejść do artykułu, kalkulatora lub produktu.

### Kryteria akceptacji

1. GDY użytkownik otworzy stronę główną, system MUSI wyświetlić trzy filary
   (Kariera / Prawo Pracy / Prawa Konsumenta) z linkami do odpowiednich sekcji.
2. GDY strona główna się załaduje, system MUSI wyświetlić listę najnowszych case
   studies (co najmniej 3) pobranych z CMS.
3. GDY strona główna się załaduje, system MUSI wyświetlić wyróżnione produkty ze
   sklepu (co najmniej 3, jeśli istnieją).
4. GDY strona główna się załaduje, system MUSI wyświetlić wyraźne CTA zapisu do
   newslettera.
5. GDY użytkownik korzysta z urządzenia mobilnego, system MUSI wyświetlić układ
   zoptymalizowany mobile-first z czytelną nawigacją do wszystkich głównych sekcji.
6. GDY strona główna się renderuje, system MUSI zawierać poprawne meta title,
   meta description oraz dane structured data typu `WebSite`/`Organization`.

---

## Wymaganie 2 — Blog / artykuły

**Historia użytkownika:** Jako osoba, która obejrzała wideo, chcę przeczytać
rozwinięty artykuł na ten temat wraz z powiązanymi narzędziami i wzorami, aby
rozwiązać swój problem lub kupić potrzebny dokument.

### Kryteria akceptacji

1. GDY autor opublikuje artykuł w Sanity, system MUSI udostępnić go pod czystym,
   czytelnym URL-em (np. `/prawo-pracy/jak-zglosic-pracodawce-do-pip`).
2. GDY użytkownik otworzy artykuł, system MUSI wyświetlić jego kategorię (filar),
   treść z semantycznymi nagłówkami (H1–H3) oraz datę publikacji/aktualizacji.
3. JEŚLI artykuł ma przypisane powiązane produkty (szablony), system MUSI
   wyświetlić je w artykule z linkiem do zakupu.
4. JEŚLI artykuł ma przypisany powiązany kalkulator, system MUSI wyświetlić do
   niego link/osadzenie.
5. GDY artykuł się renderuje, system MUSI zawierać meta title, meta description
   oraz structured data typu `Article` (autor, data, nagłówek).
6. GDY artykuł dotyczy tematyki prawnej lub zawiera kalkulator, system MUSI
   wyświetlić disclaimer „to nie jest porada prawna".
7. GDY użytkownik przegląda listę artykułów, system MUSI umożliwić filtrowanie po
   kategorii (filarze).
8. GDY autor edytuje treść w CMS, system MUSI odzwierciedlić zmiany na stronie bez
   udziału developera (aktualizacja treści przez publikację w Sanity).
9. GDY w artykule osadzone jest CTA newslettera, system MUSI umożliwić zapis bez
   opuszczania strony artykułu.

---

## Wymaganie 3 — Kalkulatory

**Historia użytkownika:** Jako osoba w sporze z pracodawcą lub ubezpieczycielem,
chcę szybko oszacować należną kwotę, aby ocenić skalę sprawy i zdecydować o
kolejnym kroku (wzór pisma / kontakt z ekspertem).

### Kryteria akceptacji — wspólne

1. GDY użytkownik wprowadzi dane w dowolnym kalkulatorze, system MUSI obliczyć
   wynik **po stronie klienta** (bez wysyłania danych obliczeniowych na serwer).
2. GDY wyświetlany jest wynik, system MUSI pokazać wyraźny disclaimer „wynik
   szacunkowy, to nie jest porada prawna".
3. GDY wyświetlany jest wynik, system MUSI udostępnić opcję „wyślij wynik na
   e-mail".
4. GDY użytkownik wybierze „wyślij wynik na e-mail", system MUSI wymagać podania
   adresu e-mail oraz zgody RODO przed wysyłką i dodaniem adresu do bazy Brevo
   (z zachowaniem double opt-in dla zapisu newsletterowego).
5. JEŚLI użytkownik nie zaznaczy zgody RODO, system MUSI zablokować wysyłkę wyniku
   e-mailem.
6. GDY dane wejściowe są nieprawidłowe lub puste, system MUSI wyświetlić czytelny
   komunikat walidacji i nie liczyć wyniku.

### Kryteria akceptacji — Kalkulator odprawy

7. GDY użytkownik poda staż pracy, system MUSI obliczyć odprawę według modelu:
   staż < 2 lata = 1 miesięczne wynagrodzenie, 2–8 lat = 2 wynagrodzenia,
   > 8 lat = 3 wynagrodzenia.
8. GDY obliczona kwota przekroczy 15-krotność minimalnego wynagrodzenia, system
   MUSI ograniczyć wynik do tego limitu i poinformować o zastosowaniu limitu.
9. GDY wyświetlany jest kalkulator odprawy, system MUSI wyraźnie wyjaśnić, że
   dotyczy zwolnień z przyczyn niedotyczących pracownika u pracodawcy
   zatrudniającego co najmniej 20 osób.

### Kryteria akceptacji — Kalkulator ekwiwalentu za urlop

10. GDY system liczy ekwiwalent, MUSI używać współczynnika ekwiwalentu pobieranego
    z **edytowalnej konfiguracji** (nie zakodowanego na stałe).
11. GDY właściciel zaktualizuje współczynnik w konfiguracji, system MUSI używać
    nowej wartości bez zmian w kodzie.

### Kryteria akceptacji — Kalkulator zaniżenia szkody całkowitej

12. GDY użytkownik wprowadzi kilka ofert rynkowych podobnych aut, system MUSI
    obliczyć medianę i/lub średnią oraz różnicę względem wyceny ubezpieczyciela.
13. GDY wyświetlany jest wynik zaniżenia, system MUSI pokazać podpowiedź z linkiem
    do powiązanego wzoru pisma w sklepie.
14. JEŚLI liczba wprowadzonych ofert jest zbyt mała, by wynik był miarodajny,
    system MUSI o tym poinformować.

---

## Wymaganie 4 — Sklep z szablonami dokumentów („Zbrojownia Konsumenta")

**Historia użytkownika:** Jako osoba potrzebująca gotowego pisma, chcę kupić
sprawdzony wzór dokumentu i szybko otrzymać go na e-mail, aby samodzielnie
załatwić sprawę bez kancelarii.

### Kryteria akceptacji

1. GDY użytkownik otworzy sklep, system MUSI wyświetlić katalog produktów
   cyfrowych z nazwą, ceną (PLN), krótkim opisem „co zawiera i kiedy użyć" oraz
   podglądem fragmentu treści.
2. GDY użytkownik otworzy stronę produktu przed zakupem, system MUSI udostępnić
   podgląd fragmentu treści dokumentu (np. pierwsza strona / wybrany wycinek), aby
   kupujący mógł ocenić zawartość przed płatnością.
3. GDY użytkownik wybierze zakup, system MUSI poprowadzić go przez płatność u
   operatora (Przelewy24 lub Tpay) obsługującego BLIK, kartę i przelew.
4. GDY płatność zakończy się sukcesem, operator MUSI wywołać webhook, a system
   MUSI zweryfikować autentyczność powiadomienia przed realizacją zamówienia.
5. GDY webhook potwierdzi płatność, system MUSI wygenerować unikalny token
   pobrania oraz wysłać przez Brevo e-mail z linkiem do pliku.
6. GDY użytkownik użyje linku do pobrania, system MUSI udostępnić plik wyłącznie
   jeśli link jest ważny (≤ 72 h od zakupu) oraz liczba pobrań nie przekroczyła 3.
7. JEŚLI link wygasł lub przekroczono limit pobrań, system MUSI zablokować pobranie
   i udostępnić opcję „wyślij ponownie" (regeneracja tokenu i ponowny e-mail).
8. GDY płatność zostanie potwierdzona, system MUSI **automatycznie** wystawić
   dokument sprzedaży (rachunek/faktura) przez API Fakturowni.pl dla **każdego**
   zakupu — na potrzeby ewidencji sprzedaży właściciela.
9. GDY użytkownik przechodzi przez checkout, system MUSI domyślnie wystawiać
   dokument na dane podane w checkout, oraz MUSI udostępnić opcjonalne pole
   „Chcę fakturę na firmę" z polami NIP i nazwa firmy.
10. JEŚLI użytkownik zaznaczy „Chcę fakturę na firmę", system MUSI wymagać
    poprawnego NIP i nazwy firmy oraz przekazać te dane do Fakturowni jako dane
    nabywcy.
11. GDY zmienia się status podatkowy właściciela (np. przejście na JDG), system MUSI
    umożliwić dostosowanie fakturowania przez konfigurację/ustawienia konta bez
    zmian w kodzie.
12. GDY strona produktu się renderuje, system MUSI zawierać meta dane oraz structured
    data typu `Product`/`Offer`.
13. PODCZAS GDY MVP nie zawiera kont użytkowników, system MUSI umożliwić dostęp do
    zakupionego pliku wyłącznie przez link e-mailowy, przy zachowaniu architektury
    umożliwiającej późniejsze dodanie strony „Moje zakupy" i kont.

---

## Wymaganie 5 — Formularz leadowy „Skomplikowana sprawa? Porozmawiaj z ekspertem"

**Historia użytkownika:** Jako osoba ze zbyt skomplikowaną sprawą, chcę zostawić
kontakt i krótki opis, aby skontaktowała się ze mną partnerska kancelaria.

### Kryteria akceptacji

1. GDY użytkownik otworzy formularz, system MUSI zebrać: rodzaj sprawy, krótki opis,
   dane kontaktowe (imię, e-mail i/lub telefon).
2. GDY użytkownik wysyła formularz, system MUSI wymagać zaznaczenia zgody RODO na
   przekazanie danych partnerowi i wyświetlić informację, komu dane są przekazywane.
3. JEŚLI zgoda RODO nie jest zaznaczona lub pola wymagane są puste, system MUSI
   zablokować wysyłkę i pokazać komunikat walidacji.
4. GDY lead zostaje zapisany, system MUSI zapisać przy nim parametry UTM (source,
   medium, campaign itd.) oraz kod partnera odczytany z linku/adresu URL.
5. JEŚLI w adresie URL brak kodu partnera, system MUSI przypisać domyślny kod
   partnera (konfigurowalny), aby każdy lead miał przypisane źródło od początku.
6. GDY lead zostaje zapisany, system MUSI automatycznie przekazać go e-mailem do
   partnera (przez Brevo), zawierając dane sprawy, kontakt, UTM i kod partnera.
7. GDY użytkownik pomyślnie wyśle formularz, system MUSI wyświetlić potwierdzenie
   i informację o dalszych krokach.
8. GDY dane leada są przetwarzane, system MUSI przechowywać je zgodnie z RODO
   (podstawa przetwarzania, informacja o odbiorcy, możliwość realizacji praw).
9. GDY właściciel loguje się do prostego panelu leadów, system MUSI wyświetlić listę
   leadów wraz z danymi sprawy, kontaktem, UTM, kodem partnera i datą zgłoszenia.
10. GDY właściciel przegląda leada w panelu, system MUSI umożliwić zmianę jego
    statusu (np. nowy / przekazany / w kontakcie / zamknięty), aby śledzić obsługę.
11. GDY panel leadów jest dostępny, system MUSI chronić dostęp do niego (uwierzytelnienie),
    ponieważ zawiera dane osobowe.

---

## Wymaganie 6 — Rezerwacja konsultacji 1:1

**Historia użytkownika:** Jako kandydat przygotowujący się do trudnej rekrutacji
lub negocjacji podwyżki, chcę opłacić i zarezerwować konsultację 1:1, aby dostać
spersonalizowane wsparcie.

### Kryteria akceptacji

1. GDY użytkownik otworzy stronę konsultacji, system MUSI wyświetlić opis oferty
   (przygotowanie do rozmowy kwalifikacyjnej / negocjacji) oraz cennik.
2. GDY użytkownik wybierze rezerwację, system MUSI przekierować/osadzić proces
   rezerwacji Cal.com zintegrowany ze Stripe.
3. GDY użytkownik rezerwuje termin, system MUSI wymagać opłacenia konsultacji
   **przed** potwierdzeniem rezerwacji (płatność przez Stripe).
4. GDY rezerwacja i płatność się powiodą, system/Cal.com MUSI wysłać potwierdzenie
   terminu na e-mail użytkownika.
5. GDY strona konsultacji się renderuje, system MUSI zawierać poprawne meta dane
   oraz disclaimer, jeśli treść tego wymaga.

---

## Wymaganie 7 — Newsletter i lead magnet

**Historia użytkownika:** Jako zainteresowany tematyką, chcę zapisać się do
newslettera z dowolnego miejsca na stronie i otrzymać darmowy pierwszy wzór
dokumentu, aby dostawać wartościowe treści i zachętę do dalszego korzystania.

### Kryteria akceptacji

1. GDY użytkownik zapisuje się do newslettera z dowolnego miejsca (artykuł,
   stopka, pop-up, wynik kalkulatora), system MUSI wymagać adresu e-mail i zgody
   RODO.
2. GDY użytkownik potwierdzi zapis, system MUSI zastosować **double opt-in**:
   wysłać e-mail potwierdzający i aktywować subskrypcję dopiero po kliknięciu
   linku potwierdzającego.
3. GDY subskrypcja zostanie potwierdzona (double opt-in), system MUSI udostępnić
   lead magnet — darmowy pierwszy wzór dokumentu — przez **osobny, prostszy
   mechanizm niż token sklepowy**: bezpośrednie pobranie na stronie potwierdzenia
   oraz dodatkowy link w e-mailu.
4. GDY generowany jest link do lead magnetu, system MUSI ustawić jego ważność na
   30 dni i **bez limitu pobrań**, oraz NIE MUSI używać logiki tokenów płatniczych
   ze sklepu.
5. GDY użytkownik odwiedza stronę, system MUSI ograniczyć częstotliwość pop-upu
   newsletterowego (np. nie pokazywać ponownie przez określony czas / po zamknięciu
   lub zapisie), aby nie był nachalny.
6. GDY użytkownik jest już zapisany lub zamknął pop-up, system MUSI respektować to
   ustawienie przy kolejnych wizytach (np. przez pamięć lokalną).
7. GDY adres trafia do bazy, system MUSI przechowywać go w Brevo z zapisaną zgodą
   i źródłem zapisu.

---

## Wymaganie 8 — Strony prawne i disclaimery

**Historia użytkownika:** Jako użytkownik i jako właściciel serwisu, chcę mieć
jasne strony prawne i widoczne disclaimery, aby budować zaufanie i działać zgodnie
z prawem.

### Kryteria akceptacji

1. GDY użytkownik szuka informacji prawnych, system MUSI udostępnić strony:
   polityka prywatności, regulamin sklepu, regulamin konsultacji.
2. GDY właściciel/prawnik dostarczy treści prawne, system MUSI je osadzić bez
   generowania własnych wiążących treści prawnych.
3. GDY użytkownik przegląda dowolną stronę z treścią prawną lub z kalkulatorem,
   system MUSI wyświetlić w stopce disclaimer „to nie jest porada prawna".
4. GDY użytkownik przegląda dowolną stronę, system MUSI udostępnić w stopce linki
   do wszystkich stron prawnych.

---

## Wymaganie 9 — Wydajność mobilna (niefunkcjonalne)

**Historia użytkownika:** Jako niecierpliwy użytkownik z linku w social media,
chcę żeby strona ładowała się błyskawicznie na telefonie, aby nie zrezygnować
przed obejrzeniem treści.

### Kryteria akceptacji

1. GDY strona ładuje się na urządzeniu mobilnym w typowych warunkach sieciowych,
   system MUSI osiągać dobre wyniki Core Web Vitals (cel: LCP < 2,5 s, CLS < 0,1,
   INP < 200 ms).
2. GDY strona jest budowana, system POWINIEN wykorzystywać renderowanie statyczne/
   serwerowe treści (artykuły, sklep) dla szybkiego pierwszego wyświetlenia.
3. GDY strona serwuje obrazy, system MUSI dostarczać je w responsywnych rozmiarach
   i nowoczesnych formatach.
4. GDY ładuje się kod JavaScript, system POWINIEN minimalizować jego ilość na
   stronach treściowych (kalkulatory ładowane w miarę potrzeby).

---

## Wymaganie 10 — SEO (niefunkcjonalne)

**Historia użytkownika:** Jako właściciel, chcę żeby serwis był dobrze widoczny w
wyszukiwarkach, aby pozyskiwać ruch organiczny obok ruchu z social media.

### Kryteria akceptacji

1. GDY tworzona jest dowolna strona, system MUSI generować czysty, czytelny URL.
2. GDY strona się renderuje, system MUSI stosować semantyczny HTML (nagłówki,
   znaczniki, atrybuty dostępności).
3. GDY serwis jest wdrożony, system MUSI udostępniać `sitemap.xml` oraz
   `robots.txt`.
4. GDY renderowana jest strona treściowa lub produktowa, system MUSI zawierać meta
   title, meta description oraz odpowiednie structured data (`Article`, `Product`,
   `Organization`).
5. GDY strona jest współdzielona w social media, system POWINIEN dostarczać znaczniki
   Open Graph / Twitter Card.

---

## Wymaganie 11 — Zgodność z RODO i prywatność (niefunkcjonalne)

**Historia użytkownika:** Jako użytkownik, chcę mieć kontrolę nad moimi danymi, a
jako właściciel — działać zgodnie z RODO.

### Kryteria akceptacji

1. GDY zbierany jest jakikolwiek adres e-mail lub dane osobowe, system MUSI
   uzyskać wyraźną zgodę i wskazać cel przetwarzania.
2. GDY użytkownik odwiedza serwis, system MUSI używać analityki privacy-first
   (Umami/Plausible) niewymagającej rozbudowanego banera zgód na cookies.
3. JEŚLI wprowadzone zostaną narzędzia wymagające zgody na cookies, system MUSI
   wyświetlić baner zgód i respektować wybór użytkownika.
4. GDY dane leada lub subskrybenta są przechowywane, system MUSI umożliwiać
   realizację praw RODO (dostęp, usunięcie) oraz przechowywać podstawę i źródło
   zgody.
5. GDY dane są przesyłane, system MUSI używać połączeń szyfrowanych (HTTPS).

---

## Wymaganie 12 — Design i zaufanie (niefunkcjonalne)

**Historia użytkownika:** Jako sfrustrowany biurokracją użytkownik, chcę prostego,
przejrzystego i wiarygodnego interfejsu, aby poczuć, że serwis realnie mi pomaga.

### Kryteria akceptacji

1. GDY projektowany jest system wizualny, system MUSI być prosty, przejrzysty i
   budzący zaufanie — nie „korporacyjny", lecz konkretny i pomocny.
2. GDY interfejs jest renderowany, system MUSI spełniać dostępność zgodną z WCAG
   2.1 na poziomie AA (kontrast, pełna nawigacja klawiaturą, etykiety pól
   formularzy, obsługa czytników ekranu, widoczny focus). Priorytet MUSI —
   ze względu na European Accessibility Act (obowiązuje dla usług cyfrowych /
   e-commerce dla konsumentów w UE od czerwca 2025), dostępność jest projektowana
   od początku, a nie dodawana później.
3. GDY użytkownik korzysta z serwisu na telefonie, system MUSI zapewniać spójne,
   czytelne i łatwe w obsłudze doświadczenie mobile-first.

---

## Wymaganie 13 — Rozszerzalność do kont użytkowników (niefunkcjonalne)

**Historia użytkownika:** Jako właściciel, chcę żeby MVP bez kont dało się łatwo
rozbudować o konta i stronę „Moje zakupy", aby nie przepisywać systemu w przyszłości.

### Kryteria akceptacji

1. GDY projektowany jest model danych zakupów, system MUSI wiązać zakup z adresem
   e-mail w sposób umożliwiający późniejsze powiązanie z kontem użytkownika.
2. GDY w przyszłości dodane zostaną konta, system POWINIEN umożliwić udostępnienie
   historii zakupów i ponownego pobierania plików bez migracji burzącej dane.

---

## Poza zakresem MVP

- Konta użytkowników z logowaniem i strona „Moje zakupy" (przygotowane pod przyszłą
  rozbudowę, ale nieimplementowane).
- Własny moduł fakturowania (realizowany przez Fakturownia.pl).
- Wielojęzyczność i inne waluty niż PLN.
- Własny system rezerwacji terminów (realizowany przez Cal.com).
- Automatyczne rozliczanie prowizji afiliacyjnych (na start tylko zapis UTM + kod
  partnera).
