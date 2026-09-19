import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const result = rateLimit(`payphone-confirm:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 10);
  if (!result.success) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const body = await request.json();
  if (typeof body.id !== "string" || typeof body.clientTransactionId !== "string") return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  const provider = getPaymentProvider("payphone");
  if (!provider) return NextResponse.json({ error: "Proveedor no disponible." }, { status: 500 });
  const resultPayment = await provider.confirmPayment({ providerTransactionId: body.id, clientTransactionId: body.clientTransactionId });
  const payment = await db.payment.update({ where: { clientTransactionId: body.clientTransactionId }, data: { providerTransactionId: body.id, status: resultPayment.status === "APPROVED" ? "APPROVED" : resultPayment.status === "CANCELLED" ? "CANCELLED" : "ERROR", rawResponse: JSON.parse(JSON.stringify(resultPayment.raw)) }, include: { order: true } });
  if (resultPayment.status === "APPROVED") await db.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } });
  return NextResponse.json({ status: resultPayment.status, raw: resultPayment.raw });
}
