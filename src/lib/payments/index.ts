import "server-only";
import type { PaymentProvider } from "./types";
import { Przelewy24Provider } from "./przelewy24";

/**
 * Fabryka dostawcy płatności. Wybór przez zmienną PAYMENT_PROVIDER.
 * Dodanie Tpay = nowa implementacja PaymentProvider + case tutaj.
 */
export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER ?? "przelewy24";
  switch (provider) {
    case "przelewy24":
      return new Przelewy24Provider();
    default:
      throw new Error(`Nieobsługiwany dostawca płatności: ${provider}`);
  }
}

export type {
  PaymentProvider,
  CreatePaymentParams,
  CreatePaymentResult,
  ConfirmTransactionParams,
  PaymentWebhookPayload,
} from "./types";
