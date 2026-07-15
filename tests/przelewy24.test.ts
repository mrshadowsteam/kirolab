import { describe, it, expect, beforeEach } from "vitest";
import { createHash } from "node:crypto";
import { Przelewy24Provider } from "@/lib/payments/przelewy24";

const CRC = "test-crc-secret";

/** Replikuje podpis powiadomienia P24 (ta sama kolejność pól co w implementacji). */
function notificationSign(fields: Record<string, unknown>): string {
  return createHash("sha384")
    .update(
      JSON.stringify({
        merchantId: fields.merchantId,
        posId: fields.posId,
        sessionId: fields.sessionId,
        amount: fields.amount,
        originAmount: fields.originAmount,
        currency: fields.currency,
        orderId: fields.orderId,
        methodId: fields.methodId,
        statement: fields.statement,
        crc: CRC,
      }),
    )
    .digest("hex");
}

describe("Przelewy24 — weryfikacja podpisu webhooka", () => {
  beforeEach(() => {
    process.env.P24_CRC = CRC;
  });

  const base = {
    merchantId: 12345,
    posId: 12345,
    sessionId: "order-abc",
    amount: 4900,
    originAmount: 4900,
    currency: "PLN",
    orderId: 987654,
    methodId: 25,
    statement: "platnosc",
  };

  it("akceptuje poprawnie podpisane powiadomienie", () => {
    const provider = new Przelewy24Provider();
    const payload = { ...base, sign: notificationSign(base) };
    expect(provider.verifyWebhookSignature(payload)).toBe(true);
  });

  it("odrzuca powiadomienie ze zmanipulowaną kwotą", () => {
    const provider = new Przelewy24Provider();
    const payload = { ...base, sign: notificationSign(base), amount: 100 };
    expect(provider.verifyWebhookSignature(payload)).toBe(false);
  });

  it("odrzuca powiadomienie bez podpisu", () => {
    const provider = new Przelewy24Provider();
    expect(provider.verifyWebhookSignature({ ...base })).toBe(false);
  });

  it("odrzuca powiadomienie z podpisem wygenerowanym innym CRC", () => {
    const provider = new Przelewy24Provider();
    const wrongSign = createHash("sha384")
      .update(JSON.stringify({ ...base, crc: "inny-crc" }))
      .digest("hex");
    const payload = { ...base, sign: wrongSign };
    expect(provider.verifyWebhookSignature(payload)).toBe(false);
  });
});
