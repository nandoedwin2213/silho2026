import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";
import { rateLimit } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validation/checkout";
import { getPromptPaymentDiscount, priceBreakdown } from "@/lib/pricing";
import { isPurchasable } from "@/lib/services";
import { toPaymentStatus } from "@/lib/payments/status";

export async function POST(request: Request) {
  const result = rateLimit(`payphone-create:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 10);
  if (!result.success) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.paymentMethod !== "PAYPHONE") return NextResponse.json({ error: "Este endpoint requiere PayPhone." }, { status: 400 });
  const service = await db.service.findUnique({ where: { id: parsed.data.serviceId } });
  if (!service || !isPurchasable(service)) return NextResponse.json({ error: "Este servicio requiere valoración." }, { status: 400 });
  const patient = await db.patient.upsert({
    where: { documentId: parsed.data.documentId },
    update: {},
    create: { firstName: parsed.data.nombre, lastName: parsed.data.apellido, documentId: parsed.data.documentId, email: parsed.data.email, phone: parsed.data.telefono, city: parsed.data.ciudad },
  });
  const discount = await getPromptPaymentDiscount();
  const breakdown = priceBreakdown(Number(service.basePrice), discount, service.discountEligible);
  const clientTransactionId = randomUUID();
  const order = await db.order.create({
    data: {
      patientId: patient.id,
      serviceId: service.id,
      basePrice: breakdown.base,
      discountPercent: breakdown.discountPercent,
      discountAmount: breakdown.savings,
      total: breakdown.discounted,
      paymentMethod: "PAYPHONE",
      acceptedTerms: parsed.data.acceptTerms,
      payments: { create: { provider: "payphone", clientTransactionId, amount: breakdown.discounted, status: "PENDING" } },
    },
    include: { payments: true },
  });
  const provider = getPaymentProvider("payphone");
  if (!provider) return NextResponse.json({ error: "Proveedor no disponible." }, { status: 500 });
  const payment = await provider.createPayment({
    orderId: order.id,
    amount: breakdown.discounted,
    currency: "USD",
    clientTransactionId,
    description: service.name,
    customer: { name: `${parsed.data.nombre} ${parsed.data.apellido}`, email: parsed.data.email, phone: parsed.data.telefono },
  });
  await db.payment.update({ where: { clientTransactionId }, data: { providerTransactionId: payment.providerRef, status: toPaymentStatus(payment.status), rawResponse: payment } });
  return NextResponse.json({ orderId: order.id, clientTransactionId, ...payment });
}
