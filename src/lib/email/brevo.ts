import "server-only";

/**
 * Adapter e-mail (Brevo): e-maile transakcyjne + zarządzanie kontaktami/listami.
 * Używa REST API Brevo (bez SDK). Wszystkie operacje po stronie serwera.
 */

const BREVO_API = "https://api.brevo.com/v3";

function apiKey(): string {
  const key = process.env.BREVO_API_KEY;
  if (!key) throw new Error("Brak zmiennej środowiskowej BREVO_API_KEY.");
  return key;
}

function defaultSender(): { email: string; name: string } {
  return {
    email: process.env.BREVO_SENDER_EMAIL ?? "no-reply@smartobywatel.pl",
    name: process.env.BREVO_SENDER_NAME ?? "Smart Obywatel",
  };
}

function headers(): Record<string, string> {
  return {
    "api-key": apiKey(),
    "content-type": "application/json",
    accept: "application/json",
  };
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendTransactionalParams {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  params?: Record<string, unknown>;
  sender?: { email: string; name: string };
  replyTo?: EmailRecipient;
}

/** Wysyła pojedynczy e-mail transakcyjny (np. link do pobrania, potwierdzenie DOI). */
export async function sendTransactionalEmail(
  input: SendTransactionalParams,
): Promise<void> {
  const res = await fetch(`${BREVO_API}/smtp/email`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      sender: input.sender ?? defaultSender(),
      to: input.to,
      subject: input.subject,
      htmlContent: input.htmlContent,
      params: input.params,
      replyTo: input.replyTo,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brevo sendTransactionalEmail ${res.status}: ${text}`);
  }
}

/**
 * Alias zgodny z nazwą metody adaptera `EmailService.sendTransactional()`
 * z dokumentu projektowego (design.md §6). Wskazuje na `sendTransactionalEmail`.
 */
export const sendTransactional = sendTransactionalEmail;

export interface UpsertContactParams {
  email: string;
  attributes?: Record<string, unknown>;
  listIds?: number[];
  updateEnabled?: boolean;
}

/** Tworzy lub aktualizuje kontakt (np. po potwierdzeniu newslettera). */
export async function upsertContact(input: UpsertContactParams): Promise<void> {
  const res = await fetch(`${BREVO_API}/contacts`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      email: input.email,
      attributes: input.attributes,
      listIds: input.listIds,
      updateEnabled: input.updateEnabled ?? true,
    }),
  });

  // 201 = utworzony, 204 = zaktualizowany istniejący (updateEnabled).
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`Brevo upsertContact ${res.status}: ${text}`);
  }
}

export interface AddToListParams {
  /** Identyfikator listy Brevo (np. BREVO_NEWSLETTER_LIST_ID). */
  listId: number;
  /** Adresy e-mail istniejących kontaktów do dodania na listę. */
  emails: string[];
}

/**
 * Dodaje istniejące kontakty do listy Brevo (np. po potwierdzeniu newslettera).
 * Endpoint: POST /contacts/lists/{listId}/contacts/add.
 */
export async function addToList(input: AddToListParams): Promise<void> {
  // Brak adresów = brak operacji (unikamy zbędnego zapytania i błędu 400).
  if (input.emails.length === 0) return;

  const res = await fetch(
    `${BREVO_API}/contacts/lists/${input.listId}/contacts/add`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ emails: input.emails }),
    },
  );

  // 201 = dodano, 204 = brak zmian (kontakty już na liście) — oba traktujemy jak sukces.
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`Brevo addToList ${res.status}: ${text}`);
  }
}
