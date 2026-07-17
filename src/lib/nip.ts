/**
 * Walidacja polskiego NIP (Numer Identyfikacji Podatkowej).
 *
 * Moduł jest czysty i wolny od zależności — może być używany zarówno po stronie
 * serwera (walidacja w API), jak i klienta (natychmiastowy komunikat w formularzu).
 *
 * NIP ma 10 cyfr, gdzie 10. cyfra jest cyfrą kontrolną wyliczaną z sumy ważonej
 * pierwszych 9 cyfr. Sama walidacja formatu (10 cyfr) nie wystarcza — akceptuje
 * numery nieistniejące (np. 0000000000), dlatego wymagane jest wymaganie 4.10
 * („poprawny NIP") realizujemy przez sprawdzenie sumy kontrolnej.
 */

/** Wagi dla pierwszych 9 cyfr NIP-u (10. cyfra to cyfra kontrolna). */
const NIP_WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7] as const;

/**
 * Normalizuje wpisany NIP: usuwa spacje i myślniki oraz opcjonalny prefiks kraju
 * „PL" (spotykany przy zapisie w formacie NIP UE), zwracając same cyfry.
 */
export function normalizeNip(input: string): string {
  return input.replace(/[\s-]/g, "").replace(/^PL/i, "");
}

/**
 * Sprawdza poprawność polskiego NIP: format (dokładnie 10 cyfr) oraz sumę
 * kontrolną. Odrzuca też oczywiście nieprawidłowe numery złożone z samych zer,
 * które przechodzą samą sumę kontrolną.
 */
export function isValidNip(input: string): boolean {
  const nip = normalizeNip(input);
  if (!/^\d{10}$/.test(nip)) return false;
  if (/^0{10}$/.test(nip)) return false;

  const digits = nip.split("").map(Number);
  const weightedSum = NIP_WEIGHTS.reduce(
    (sum, weight, index) => sum + weight * digits[index],
    0,
  );
  const checkDigit = weightedSum % 11;
  // Reszta 10 oznacza NIP nieprawidłowy (taka cyfra kontrolna nie istnieje).
  if (checkDigit === 10) return false;

  return checkDigit === digits[9];
}
