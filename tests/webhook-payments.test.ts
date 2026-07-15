import { describe, it, expect, beforeEach, vi } from "vitest";

// Mockujemy zależności serwerowe zanim zaimportujemy handler webhooka.
vi.mock("@/lib/prisma", () => ({
  prisma: { order: { findUnique: vi.fn(), update: vi.fn() } },
}));
vi.mock("@/lib/payments", () => ({ getPaymentProvider: vi.fn() }));
vi.mock("@/lib/fulfillment", () => ({ fulfillPaidOrder: vi.fn() }));

import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payments";
import { fulfillPaidOrder } from "@/lib/fulfillment";
import { POST } from "@/app/api/webhooks/payments/route";

/* eslint-disable @typescript-eslint/no-explicit-any */
function makeReq(body: unknown) {
  return { json: async () => body } as any;
}

let provider: { verifyWebhookSignature: any; confirmTransaction: any };

beforeEach(() => {
  vi.clearAllMocks();
  provider = {
    verifyWebhookSignature: vi.fn().mockReturnValue(true),
    confirmTransaction: vi.fn().mockResolvedValue(true),
  };
  (getPaymentProvider as any).mockReturnValue(provider);
});

const validBody = { sessionId: "order-1", orderId: 987654, sign: "sig" };
const pendingOrder = {
  id: "order-1",
  status: "pending",
  amountGrosze: 4900,
  currency: "PLN",
};

describe("Webhook P24 — bezpieczeństwo i przepływ", () => {
  it("odrzuca żądanie z nieprawidłowym podpisem (401)", async () => {
    provider.verifyWebhookSignature.mockReturnValue(false);
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(401);
    expect(prisma.order.findUnique).not.toHaveBeenCalled();
  });

  it("odrzuca żądanie bez sessionId (400)", async () => {
    const res = await POST(makeReq({ orderId: 987654, sign: "sig" }));
    expect(res.status).toBe(400);
  });

  it("zwraca 404, gdy zamówienie nie istnieje", async () => {
    (prisma.order.findUnique as any).mockResolvedValue(null);
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(404);
  });

  it("jest idempotentny — dla opłaconego zamówienia nie realizuje ponownie", async () => {
    (prisma.order.findUnique as any).mockResolvedValue({
      ...pendingOrder,
      status: "paid",
    });
    const res = await POST(makeReq(validBody));
    const body = await res.json();
    expect(body.alreadyProcessed).toBe(true);
    expect(provider.confirmTransaction).not.toHaveBeenCalled();
    expect(prisma.order.update).not.toHaveBeenCalled();
    expect(fulfillPaidOrder).not.toHaveBeenCalled();
  });

  it("przy nieudanym/przerwanym potwierdzeniu nie oznacza jako opłacone (400)", async () => {
    (prisma.order.findUnique as any).mockResolvedValue(pendingOrder);
    provider.confirmTransaction.mockResolvedValue(false);
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(400);
    expect(prisma.order.update).not.toHaveBeenCalled();
    expect(fulfillPaidOrder).not.toHaveBeenCalled();
  });

  it("dla poprawnej płatności oznacza jako opłacone i realizuje zamówienie", async () => {
    (prisma.order.findUnique as any).mockResolvedValue(pendingOrder);
    const paidOrder = { ...pendingOrder, status: "paid" };
    (prisma.order.update as any).mockResolvedValue(paidOrder);

    const res = await POST(makeReq(validBody));
    const body = await res.json();

    expect(body.ok).toBe(true);
    expect(provider.confirmTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: "order-1",
        orderId: 987654,
        amountGrosze: 4900,
        currency: "PLN",
      }),
    );
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order-1" },
        data: expect.objectContaining({ status: "paid" }),
      }),
    );
    expect(fulfillPaidOrder).toHaveBeenCalledWith(paidOrder);
  });
});
