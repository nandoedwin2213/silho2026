import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";
import { getPromptPaymentDiscount, priceBreakdown } from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validation/checkout";

export async function POST(request: Request) {
  const limited = rateLimit(`order:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 10);
  if (!limited.success) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;
  const service = await db.service.findFirst({ where: { id: input.serviceId, active: true } });
  if (!service || service.isSurgical || service.requiresMedicalAssessment || service.requiresManualQuote || !service.showPrice) return NextResponse.json({ error: "Este servicio requiere valoración médica." }, { status: 400 });
  const discount = await getPromptPaymentDiscount();
  const breakdown = priceBreakdown(Number(service.basePrice), discount, service.discountEligible);
  const order = await db.$transaction(async (tx) => {
    const patient = await tx.patient.upsert({ where: { documentId: input.documentId }, update: { firstName: input.nombre, lastName: input.apellido, email: input.email, phone: input.telefono, city: input.ciudad }, create: { firstName: input.nombre, lastName: input.apellido, documentId: input.documentId, email: input.email, phone: input.telefono, city: input.ciudad } });
    return tx.order.create({ data: { patientId: patient.id, serviceId: service.id, basePrice: breakdown.base, discountPercent: breakdown.discountPercent, discountAmount: breakdown.savings, total: breakdown.discounted, paymentMethod: input.paymentMethod, acceptedTerms: input.acceptTerms } });
  });
  if (input.paymentMethod !== "PAYPHONE") return NextResponse.json({ orderId: order.id, status: "PENDING" });
  const provider = getPaymentProvider("payphone");
  if (!provider) return NextResponse.json({ orderId: order.id, status: "PENDING_CONFIGURATION" });
  const clientTransactionId = `silho-${order.id}`;
  const payment = await db.payment.create({ data: { orderId: order.id, provider: provider.name, clientTransactionId, amount: breakdown.discounted, status: "PENDING" } });
  try {
    const result = await provider.createPayment({ orderId: order.id, amount: breakdown.discounted, currency: "USD", clientTransactionId, description: service.name, customer: { name: `${input.nombre} ${input.apellido}`, email: input.email, phone: input.telefono } });
    if (result.providerRef) await db.payment.update({ where: { id: payment.id }, data: { providerTransactionId: result.providerRef } });
    return NextResponse.json({ orderId: order.id, status: result.status, redirectUrl: result.redirectUrl });
  } catch {
    await db.payment.update({ where: { id: payment.id }, data: { status: "ERROR" } });
    return NextResponse.json({ error: "No pudimos iniciar el pago en este momento." }, { status: 502 });
  }
}
