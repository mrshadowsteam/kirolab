import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import type {
  ConfirmTransactionParams,
  CreatePaymentParams,
  CreatePaymentResult,
  PaymentProvider,
  PaymentWebhookPayload,
} from "./types";

/**
 * Implementacja Przelewy24 (REST API v1). Obsługuje BLIK, kartę i szybki przelew.
 *
 * Kolejność pól w podpisach SHA-384 jest zgodna z oficjalną specyfikacją
 * P24 REST API v1 (potwierdzone z dokumentacją operatora):
 *   - transaction/register: { sessionId, merchantId, amount, currency, crc }
 *   - notification (webhook): { merchantId, posId, sessionId, amount, originAmount,
 *       currency, orderId, methodId, statement, crc }
 *   - transaction/verify:   { sessionId, orderId, amount, currency, crc }
 * Podpis = sha384(JSON.stringify(obiekt_o_powyższej_kolejności)).
 *
 * UWAGA: przed produkcją wykonaj płatność testową w środowisku sandbox P24,
 * aby potwierdzić poprawność kluczy (P24_CRC/P24_API_KEY) i przepływu webhooka.
 */

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Brak zmiennej środowiskowej ${name}.`);
  return value;
}

function baseUrl(): string {
  return process.env.P24_SANDBOX === "false"
    ? "https://secure.przelewy24.pl"
    : "https://sandbox.przelewy24.pl";
}

/** Podpis P24 = SHA-384 z JSON o ściśle określonej kolejności kluczy. */
function sign(payload: Record<string, unknown>): string {
  return createHash("sha384").update(JSON.stringify(payload)).digest("hex");
}

function authHeader(): string {
  const credentials = `${env("P24_POS_ID")}:${env("P24_API_KEY")}`;
  return "Basic " + Buffer.from(credentials).toString("base64");
}

export class Przelewy24Provider implements PaymentProvider {
  readonly name = "przelewy24";

  async createPayment(
    params: CreatePaymentParams,
  ): Promise<CreatePaymentResult> {
    const merchantId = Number(env("P24_MERCHANT_ID"));
    const posId = Number(env("P24_POS_ID"));
    const crc = env("P24_CRC");
    const currency = params.currency ?? "PLN";

    const signature = sign({
      sessionId: params.orderId,
      merchantId,
      amount: params.amountGrosze,
      currency,
      crc,
    });

    const res = await fetch(`${baseUrl()}/api/v1/transaction/register`, {
      method: "POST",
      headers: { authorization: authHeader(), "content-type": "application/json" },
      body: JSON.stringify({
        merchantId,
        posId,
        sessionId: params.orderId,
        amount: params.amountGrosze,
        currency,
        description: params.description,
        email: params.email,
        country: "PL",
        language: "pl",
        urlReturn: params.urlReturn,
        urlStatus: params.urlStatus,
        sign: signature,
        encoding: "UTF-8",
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Przelewy24 register ${res.status}: ${text}`);
    }

    const json = (await res.json()) as { data?: { token?: string } };
    const token = json.data?.token;
    if (!token) {
      throw new Error("Przelewy24 register: brak tokenu w odpowiedzi.");
    }

    return {
      redirectUrl: `${baseUrl()}/trnRequest/${token}`,
      providerRef: token,
    };
  }

  verifyWebhookSignature(payload: PaymentWebhookPayload): boolean {
    if (typeof payload.sign !== "string") return false;

    const crc = env("P24_CRC");
    const expected = sign({
      merchantId: payload.merchantId,
      posId: payload.posId,
      sessionId: payload.sessionId,
      amount: payload.amount,
      originAmount: payload.originAmount,
      currency: payload.currency,
      orderId: payload.orderId,
      methodId: payload.methodId,
      statement: payload.statement,
      crc,
    });

    // Porównanie w czasie stałym, aby nie ujawniać podpisu przez timing.
    const received = Buffer.from(payload.sign, "utf8");
    const computed = Buffer.from(expected, "utf8");
    if (received.length !== computed.length) return false;
    return timingSafeEqual(received, computed);
  }

  async confirmTransaction(
    params: ConfirmTransactionParams,
  ): Promise<boolean> {
    const merchantId = Number(env("P24_MERCHANT_ID"));
    const posId = Number(env("P24_POS_ID"));
    const crc = env("P24_CRC");
    const currency = params.currency ?? "PLN";

    const signature = sign({
      sessionId: params.sessionId,
      orderId: params.orderId,
      amount: params.amountGrosze,
      currency,
      crc,
    });

    const res = await fetch(`${baseUrl()}/api/v1/transaction/verify`, {
      method: "PUT",
      headers: { authorization: authHeader(), "content-type": "application/json" },
      body: JSON.stringify({
        merchantId,
        posId,
        sessionId: params.sessionId,
        amount: params.amountGrosze,
        currency,
        orderId: params.orderId,
        sign: signature,
      }),
    });

    if (!res.ok) return false;
    const json = (await res.json()) as { data?: { status?: string } };
    return json.data?.status === "success";
  }
}
