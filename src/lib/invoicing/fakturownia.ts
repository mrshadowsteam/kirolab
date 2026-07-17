import "server-only";

/**
 * Adapter fakturowania (Fakturownia.pl). Automatycznie wystawia dokument
 * sprzedaży dla każdego zakupu. Typ dokumentu i dane sprzedawcy są w konfiguracji,
 * więc przejście osoba prywatna/nierejestrowana -> JDG nie wymaga zmian w kodzie.
 *
 * FAKTUROWNIA_INVOICE_KIND: np. "bill" (rachunek) dla nie-VAT, "vat" po przejściu na VAT.
 */

export interface CreateInvoiceInput {
  orderId: string;
  buyerName?: string;
  buyerEmail: string;
  /** Dane firmy, jeśli kupujący zaznaczył „Chcę fakturę na firmę". */
  companyName?: string;
  companyNip?: string;
  productTitle: string;
  /** Kwota brutto w groszach. */
  amountGrosze: number;
}

export interface CreateInvoiceResult {
  invoiceId: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Stawka podatku dla pozycji z konfiguracji (FAKTUROWNIA_TAX).
 * - Nie-VAT: wartości specjalne Fakturowni jako string ("disabled", "zw", "np", "oo").
 * - VAT (po przejściu na JDG): stawka liczbowa, np. 23 — Fakturownia oczekuje liczby,
 *   więc numeryczne wartości z env (zawsze string) zamieniamy na number.
 * Domyślnie "disabled" (osoba prywatna / działalność nierejestrowana).
 */
function resolveTax(): number | string {
  const raw = process.env.FAKTUROWNIA_TAX ?? "disabled";
  const trimmed = raw.trim();
  const numeric = Number(trimmed);
  return trimmed !== "" && Number.isFinite(numeric) ? numeric : trimmed;
}

export async function createInvoiceForOrder(
  input: CreateInvoiceInput,
): Promise<CreateInvoiceResult> {
  const domain = process.env.FAKTUROWNIA_DOMAIN;
  const apiToken = process.env.FAKTUROWNIA_API_TOKEN;
  if (!domain || !apiToken) {
    throw new Error(
      "Brak konfiguracji Fakturowni (FAKTUROWNIA_DOMAIN / FAKTUROWNIA_API_TOKEN).",
    );
  }

  const kind = process.env.FAKTUROWNIA_INVOICE_KIND ?? "bill";
  const totalPriceGross = (input.amountGrosze / 100).toFixed(2);
  const buyerName =
    input.companyName ?? input.buyerName ?? input.buyerEmail;

  const payload = {
    api_token: apiToken,
    invoice: {
      kind,
      sell_date: today(),
      issue_date: today(),
      payment_to: today(),
      status: "paid",
      seller_name: process.env.FAKTUROWNIA_SELLER_NAME ?? "Smart Obywatel",
      buyer_name: buyerName,
      buyer_email: input.buyerEmail,
      buyer_tax_no: input.companyNip ?? null,
      // Nie-VAT: podatek wyłączony ("disabled"); VAT/JDG: stawka liczbowa (np. 23).
      positions: [
        {
          name: input.productTitle,
          tax: resolveTax(),
          total_price_gross: totalPriceGross,
          quantity: 1,
        },
      ],
    },
  };

  const res = await fetch(`https://${domain}.fakturownia.pl/invoices.json`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fakturownia createInvoice ${res.status}: ${text}`);
  }

  const json = (await res.json()) as { id?: number };
  if (!json.id) {
    throw new Error("Fakturownia: brak id dokumentu w odpowiedzi.");
  }

  return { invoiceId: String(json.id) };
}
