import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";
import { getWebDiscountFor, priceBreakdown } from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validation/checkout";
import { isPurchasable } from "@/lib/services";
import { getPatientSession } from "@/lib/patient-auth";
import { computeMaxRedeemable, getPointsBalance, pointsToUsd } from "@/lib/rewards";
import { getSettings } from "@/lib/settings";
import { signPublicToken } from "@/lib/public-token";
import { markOrderFailed } from "@/lib/orders";

export async function POST(request: Request) {
  const limited = rateLimit(`order:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 10);
  if (!limited.success) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;
  const service = await db.service.findFirst({ where: { id: input.serviceId, active: true } });
  if (!service || !isPurchasable(service)) return NextResponse.json({ error: "Este servicio requiere valoración médica." }, { status: 400 });
  const session = await getPatientSession();
  const discount = input.paymentMethod === "PAYPHONE" ? await getWebDiscountFor(service) : 0;
  const settings = await getSettings(["REWARDS_MAX_REDEEM_PERCENT", "REWARDS_POINT_VALUE_USD"]);
  const pointValue = Number(settings.REWARDS_POINT_VALUE_USD ?? "0.05");
  const regularBreakdown = priceBreakdown(Number(service.basePrice), discount, service.discountEligible);
  const maxPoints = session ? computeMaxRedeemable(await getPointsBalance(db, session.patientId), regularBreakdown.discounted, Number(settings.REWARDS_MAX_REDEEM_PERCENT ?? "20"), pointValue) : 0;
  if (input.pointsRedeemed % 100 !== 0) return NextResponse.json({ error: "La cantidad de puntos no es válida." }, { status: 400 });
  if (input.pointsRedeemed > maxPoints) return NextResponse.json({ error: "La cantidad de puntos supera el máximo permitido." }, { status: 400 });
  const pointsDiscount = pointsToUsd(input.pointsRedeemed, pointValue);
  const breakdown = priceBreakdown(Number(service.basePrice), discount, service.discountEligible, pointsDiscount);
  let order;
  try {
    order = await db.$transaction(async (tx) => {
    let patient = session ? await tx.patient.findUnique({ where: { id: session.patientId } }) : await tx.patient.findUnique({ where: { documentId: input.documentId } });
    if (!patient) patient = await tx.patient.create({ data: { firstName: input.nombre, lastName: input.apellido, documentId: input.documentId, email: input.email, phone: input.telefono, city: input.ciudad } });
    if (!patient) throw new Error("Paciente no encontrado.");
    if (input.referralCode) {
      const referrer = await tx.patientAccount.findUnique({ where: { referralCode: input.referralCode.toUpperCase() } });
      if (!referrer || referrer.patientId === patient.id) throw new Error("El código de referido no es válido.");
    }
    const currentPoints = await getPointsBalance(tx, patient.id);
    if (input.pointsRedeemed % 100 !== 0) throw new Error("La cantidad de puntos no es válida.");
    if (input.pointsRedeemed > computeMaxRedeemable(currentPoints, regularBreakdown.discounted, Number(settings.REWARDS_MAX_REDEEM_PERCENT ?? "20"), pointValue)) throw new Error("La cantidad de puntos supera el máximo permitido.");
    const order = await tx.order.create({ data: { patientId: patient.id, serviceId: service.id, basePrice: breakdown.base, discountPercent: breakdown.discountPercent, discountAmount: breakdown.base - breakdown.discounted, pointsRedeemed: input.pointsRedeemed, pointsDiscount, referralCode: input.referralCode?.toUpperCase(), total: breakdown.discounted, paymentMethod: input.paymentMethod, acceptedTerms: input.acceptTerms, channel: "WEB" } });
    if (input.pointsRedeemed > 0) await tx.pointsTransaction.create({ data: { patientId: patient.id, points: -input.pointsRedeemed, reason: "REDEMPTION", description: `Canje aplicado a la orden ${order.id}`, orderId: order.id } });
    return order;
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No pudimos crear la orden." }, { status: 400 });
  }
  if (input.paymentMethod !== "PAYPHONE") return NextResponse.json({ orderId: order.id, status: "PENDING", redirectUrl: `/checkout/gracias/${order.id}?t=${signPublicToken(order.id)}` });
  const provider = getPaymentProvider("payphone");
  if (!provider) return NextResponse.json({ orderId: order.id, status: "PENDING_CONFIGURATION", redirectUrl: `/checkout/gracias/${order.id}?configuracion=pendiente&t=${signPublicToken(order.id)}` });
  const clientTransactionId = `silho-${order.id}`;
  const payment = await db.payment.create({ data: { orderId: order.id, provider: provider.name, clientTransactionId, amount: breakdown.discounted, status: "PENDING" } });
  try {
    const result = await provider.createPayment({ orderId: order.id, amount: breakdown.discounted, currency: "USD", clientTransactionId, description: service.name, customer: { name: `${input.nombre} ${input.apellido}`, email: input.email, phone: input.telefono } });
    if (result.providerRef) await db.payment.update({ where: { id: payment.id }, data: { providerTransactionId: result.providerRef } });
    if (result.status === "REJECTED" || result.status === "CANCELLED" || result.status === "ERROR") await markOrderFailed(order.id);
    return NextResponse.json({ orderId: order.id, status: result.status, redirectUrl: result.redirectUrl ?? `/checkout/gracias/${order.id}?t=${signPublicToken(order.id)}` });
  } catch {
    await db.payment.update({ where: { id: payment.id }, data: { status: "ERROR" } });
    await markOrderFailed(order.id);
    return NextResponse.json({ error: "No pudimos iniciar el pago en este momento." }, { status: 502 });
  }
}
