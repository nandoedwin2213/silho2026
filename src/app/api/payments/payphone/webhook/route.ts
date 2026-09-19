import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const result = rateLimit(`payphone-webhook:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 30);
  if (!result.success) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const provider = getPaymentProvider("payphone");
  if (!provider) return NextResponse.json({ error: "Proveedor no disponible." }, { status: 500 });
  const webhook = await provider.parseWebhook(request);
  const payment = await db.payment.update({ where: { clientTransactionId: webhook.clientTransactionId }, data: { providerTransactionId: webhook.providerTransactionId, status: webhook.status === "APPROVED" ? "APPROVED" : webhook.status === "CANCELLED" ? "CANCELLED" : "ERROR", rawResponse: JSON.parse(JSON.stringify(webhook.raw)) }, include: { order: true } });
  if (webhook.status === "APPROVED") await db.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } });
  return NextResponse.json({ received: true });
}
