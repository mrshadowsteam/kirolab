/**
 * Wspólny interfejs dostawcy płatności. Pozwala wymienić operatora
 * (Przelewy24 -> Tpay) bez zmian w logice sklepu.
 */

export interface CreatePaymentParams {
  /** Nasz identyfikator zamówienia (używany jako sessionId u operatora). */
  orderId: string;
  amountGrosze: number;
  currency?: string;
  description: string;
  email: string;
  /** URL powrotu użytkownika po płatności. */
  urlReturn: string;
  /** URL webhooka (powiadomienie serwer-serwer). */
  urlStatus: string;
}

export interface CreatePaymentResult {
  /** Adres, na który przekierowujemy użytkownika, by dokończył płatność. */
  redirectUrl: string;
  /** Referencja operatora (token/sesja) do zapisania przy zamówieniu. */
  providerRef: string;
}

export interface ConfirmTransactionParams {
  sessionId: string;
  /** Numeryczny identyfikator transakcji od operatora (z webhooka). */
  orderId: number;
  amountGrosze: number;
  currency?: string;
}

export type PaymentWebhookPayload = Record<string, unknown>;

export interface PaymentProvider {
  readonly name: string;
  /** Rejestruje płatność i zwraca URL do przekierowania. */
  createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult>;
  /** Weryfikuje podpis powiadomienia webhook. */
  verifyWebhookSignature(payload: PaymentWebhookPayload): boolean;
  /** Potwierdza transakcję po stronie operatora (server-to-server). */
  confirmTransaction(params: ConfirmTransactionParams): Promise<boolean>;
}
