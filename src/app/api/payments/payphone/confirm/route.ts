import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";
import { rateLimit } from "@/lib/rate-limit";
import { toPaymentStatus } from "@/lib/payments/status";
import { markOrderFailed, markOrderPaid } from "@/lib/orders";
import { settleSubscriptionPayment } from "@/lib/subscriptions";

export async function POST(request: Request) {
  const result = rateLimit(`payphone-confirm:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 10);
  if (!result.success) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const body = await request.json();
  if (typeof body.id !== "string" || typeof body.clientTransactionId !== "string") return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  const provider = getPaymentProvider("payphone");
  if (!provider) return NextResponse.json({ error: "Proveedor no disponible." }, { status: 500 });
  const resultPayment = await provider.confirmPayment({ providerTransactionId: body.id, clientTransactionId: body.clientTransactionId });
  if (body.clientTransactionId.startsWith("SUB-")) {
    const settled = await settleSubscriptionPayment({ clientTransactionId: body.clientTransactionId, providerTransactionId: body.id, status: resultPayment.status, raw: resultPayment.raw, ctoken: typeof body.ctoken === "string" ? body.ctoken : undefined });
    return NextResponse.json({ status: resultPayment.status, raw: resultPayment.raw, subscription: settled.status });
  }
  const paymentStatus = toPaymentStatus(resultPayment.status);
  const payment = await db.payment.update({ where: { clientTransactionId: body.clientTransactionId }, data: { providerTransactionId: body.id, status: paymentStatus, rawResponse: JSON.parse(JSON.stringify(resultPayment.raw)) }, include: { order: true } });
  if (paymentStatus === "APPROVED") await markOrderPaid(payment.orderId);
  else if (paymentStatus === "REJECTED" || paymentStatus === "CANCELLED" || paymentStatus === "ERROR") await markOrderFailed(payment.orderId);
  return NextResponse.json({ status: resultPayment.status, raw: resultPayment.raw });
}
