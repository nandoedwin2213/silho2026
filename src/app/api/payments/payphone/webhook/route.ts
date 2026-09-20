import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";
import { rateLimit } from "@/lib/rate-limit";
import { toPaymentStatus } from "@/lib/payments/status";
import { markOrderFailed, markOrderPaid } from "@/lib/orders";
import { settleSubscriptionPayment } from "@/lib/subscriptions";

export async function POST(request: Request) {
  const result = rateLimit(`payphone-webhook:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 30);
  if (!result.success) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const provider = getPaymentProvider("payphone");
  if (!provider) return NextResponse.json({ error: "Proveedor no disponible." }, { status: 500 });
  if (!provider.isConfigured()) return NextResponse.json({ received: true, status: 202 }, { status: 202 });
  const webhook = await provider.parseWebhook(request);
  if (!webhook.clientTransactionId || !webhook.providerTransactionId) return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  const confirmation = await provider.confirmPayment({ providerTransactionId: webhook.providerTransactionId, clientTransactionId: webhook.clientTransactionId });
  if (webhook.clientTransactionId.startsWith("SUB-")) {
    const raw = webhook.raw && typeof webhook.raw === "object" ? webhook.raw as Record<string, unknown> : {};
    await settleSubscriptionPayment({ clientTransactionId: webhook.clientTransactionId, providerTransactionId: webhook.providerTransactionId, status: confirmation.status, raw: confirmation.raw, ctoken: typeof raw.ctoken === "string" ? raw.ctoken : undefined });
    return NextResponse.json({ received: true });
  }
  const paymentStatus = toPaymentStatus(confirmation.status);
  const payment = await db.payment.update({ where: { clientTransactionId: webhook.clientTransactionId }, data: { providerTransactionId: webhook.providerTransactionId, status: paymentStatus, rawResponse: JSON.parse(JSON.stringify(confirmation.raw)) }, include: { order: true } });
  if (paymentStatus === "APPROVED") await markOrderPaid(payment.orderId);
  else if (paymentStatus === "REJECTED" || paymentStatus === "CANCELLED" || paymentStatus === "ERROR") await markOrderFailed(payment.orderId);
  return NextResponse.json({ received: true });
}
