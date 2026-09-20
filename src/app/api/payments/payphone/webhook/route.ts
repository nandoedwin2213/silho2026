import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";
import { rateLimit } from "@/lib/rate-limit";
import { toPaymentStatus } from "@/lib/payments/status";
import { markOrderPaid } from "@/lib/orders";

export async function POST(request: Request) {
  const result = rateLimit(`payphone-webhook:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 30);
  if (!result.success) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const provider = getPaymentProvider("payphone");
  if (!provider) return NextResponse.json({ error: "Proveedor no disponible." }, { status: 500 });
  if (!provider.isConfigured()) return NextResponse.json({ received: true, status: 202 }, { status: 202 });
  const webhook = await provider.parseWebhook(request);
  if (!webhook.clientTransactionId || !webhook.providerTransactionId) return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  const confirmation = await provider.confirmPayment({ providerTransactionId: webhook.providerTransactionId, clientTransactionId: webhook.clientTransactionId });
  const paymentStatus = toPaymentStatus(confirmation.status);
  const payment = await db.payment.update({ where: { clientTransactionId: webhook.clientTransactionId }, data: { providerTransactionId: webhook.providerTransactionId, status: paymentStatus, rawResponse: JSON.parse(JSON.stringify(confirmation.raw)) }, include: { order: true } });
  if (paymentStatus === "APPROVED") await markOrderPaid(payment.orderId);
  return NextResponse.json({ received: true });
}
