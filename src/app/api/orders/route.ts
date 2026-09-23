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
import { sendEmail } from "@/lib/notifications";
import { normalizePhone, placeholderDocumentId } from "@/lib/phone";

export async function POST(request: Request) {
  const limited = rateLimit(`order:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 10);
  if (!limited.success) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;
  if (input.preferredDate) {
    const preferredDate = new Date(`${input.preferredDate}T12:00:00Z`);
    const today = new Date();
    const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 12));
    const latest = new Date(start);
    latest.setUTCDate(latest.getUTCDate() + 60);
    if (Number.isNaN(preferredDate.getTime()) || preferredDate < start || preferredDate > latest || preferredDate.getUTCDay() === 0) {
      return NextResponse.json({ error: "Seleccione una fecha válida entre hoy y los próximos 60 días; no atendemos domingos." }, { status: 400 });
    }
  }
  const selectedLocation = input.locationId
    ? await db.location.findFirst({ where: { id: input.locationId, active: true }, select: { id: true, city: true } })
    : null;
  if (input.locationId && !selectedLocation) return NextResponse.json({ error: "La sede seleccionada no está disponible." }, { status: 400 });
  const service = await db.service.findFirst({ where: { id: input.serviceId, active: true } });
  if (!service || !isPurchasable(service)) return NextResponse.json({ error: "Este servicio requiere valoración médica." }, { status: 400 });
  const session = await getPatientSession();
  const rawPhone = input.telefono.trim();
  const phone = normalizePhone(rawPhone);
  if (phone.length < 7) return NextResponse.json({ error: "Ingrese un número de WhatsApp válido." }, { status: 400 });
  const discount = await getWebDiscountFor(service);
  const settings = await getSettings(["REWARDS_MAX_REDEEM_PERCENT", "REWARDS_POINT_VALUE_USD"]);
  const pointValue = Number(settings.REWARDS_POINT_VALUE_USD ?? "0.05");
  const webPrice = service.webPrice == null ? null : Number(service.webPrice);
  const regularBreakdown = priceBreakdown(Number(service.basePrice), discount, service.discountEligible, 0, webPrice);
  const maxPoints = session ? computeMaxRedeemable(await getPointsBalance(db, session.patientId), regularBreakdown.discounted, Number(settings.REWARDS_MAX_REDEEM_PERCENT ?? "20"), pointValue) : 0;
  if (input.pointsRedeemed % 100 !== 0) return NextResponse.json({ error: "La cantidad de puntos no es válida." }, { status: 400 });
  if (input.pointsRedeemed > maxPoints) return NextResponse.json({ error: "La cantidad de puntos supera el máximo permitido." }, { status: 400 });
  const pointsDiscount = pointsToUsd(input.pointsRedeemed, pointValue);
  const breakdown = priceBreakdown(Number(service.basePrice), discount, service.discountEligible, pointsDiscount, webPrice);
  let order;
  try {
    order = await db.$transaction(async (tx) => {
    let patient = session
      ? await tx.patient.findUnique({ where: { id: session.patientId } })
      : input.documentId
        ? await tx.patient.findUnique({ where: { documentId: input.documentId } })
        : await tx.patient.findFirst({ where: { phone: { in: [phone, rawPhone] } }, orderBy: { createdAt: "asc" } });
    if (!patient) patient = await tx.patient.create({ data: { firstName: input.nombre, lastName: input.apellido ?? "", documentId: input.documentId ?? placeholderDocumentId(phone), email: input.email ?? "", phone, city: selectedLocation?.city ?? input.ciudad ?? "Quito" } });
    if (!patient) throw new Error("Paciente no encontrado.");
    if (input.referralCode) {
      const referrer = await tx.patientAccount.findUnique({ where: { referralCode: input.referralCode.toUpperCase() } });
      if (!referrer || referrer.patientId === patient.id) throw new Error("El código de referido no es válido.");
    }
    const currentPoints = await getPointsBalance(tx, patient.id);
    if (input.pointsRedeemed % 100 !== 0) throw new Error("La cantidad de puntos no es válida.");
    if (input.pointsRedeemed > computeMaxRedeemable(currentPoints, regularBreakdown.discounted, Number(settings.REWARDS_MAX_REDEEM_PERCENT ?? "20"), pointValue)) throw new Error("La cantidad de puntos supera el máximo permitido.");
    const order = await tx.order.create({ data: { patientId: patient.id, serviceId: service.id, locationId: input.locationId, preferredDate: input.preferredDate ? new Date(`${input.preferredDate}T12:00:00Z`) : null, preferredSlot: input.preferredSlot, patientGoal: input.patientGoal, basePrice: breakdown.base, discountPercent: breakdown.discountPercent, discountAmount: breakdown.base - breakdown.discounted, pointsRedeemed: input.pointsRedeemed, pointsDiscount, referralCode: input.referralCode?.toUpperCase(), total: breakdown.discounted, paymentMethod: input.paymentMethod, acceptedTerms: input.acceptTerms, channel: "WEB" } });
    if (input.pointsRedeemed > 0) await tx.pointsTransaction.create({ data: { patientId: patient.id, points: -input.pointsRedeemed, reason: "REDEMPTION", description: `Canje aplicado a la orden ${order.id}`, orderId: order.id } });
    return order;
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No pudimos crear la orden." }, { status: 400 });
  }
  const whatsappUrl = `https://wa.me/${process.env.WHATSAPP_NUMBER ?? "593989049001"}?text=${encodeURIComponent(`Hola SILHO, recibí mi solicitud para ${service.name}.`)}`;
  const location = input.locationId ? await db.location.findUnique({ where: { id: input.locationId }, select: { name: true, city: true } }) : null;
  const appointmentDetails = [location ? `${location.name} · ${location.city}` : null, input.preferredDate, input.preferredSlot].filter(Boolean).join(" · ");
  await Promise.all([
    input.email ? sendEmail({
      to: input.email,
      subject: `SILHO · solicitud recibida para ${service.name}`,
      html: `<p>Hola ${input.nombre}, recibimos tu solicitud para <strong>${service.name}</strong>.</p><p>${appointmentDetails || "Nuestro equipo te contactará para confirmar los detalles."}</p><p>Total registrado: USD ${Number(order.total).toFixed(2)}.</p>`,
    }) : Promise.resolve({ sent: false }),
    process.env.ADMIN_EMAIL ? sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `Nueva solicitud SILHO · ${service.name}`,
      html: `<p>Nueva solicitud de ${input.nombre} ${input.apellido ?? ""} (${input.email ?? "sin correo"}, ${phone}).</p><p>Servicio: <strong>${service.name}</strong><br />${appointmentDetails || "Sin fecha preferida"}<br />Total: USD ${Number(order.total).toFixed(2)}</p>`,
    }) : Promise.resolve({ sent: false }),
  ]);
  if (input.paymentMethod !== "PAYPHONE") return NextResponse.json({ orderId: order.id, status: "PENDING", whatsappUrl, redirectUrl: `/checkout/gracias/${order.id}?t=${signPublicToken(order.id)}` });
  const provider = getPaymentProvider("payphone");
  if (!provider) return NextResponse.json({ orderId: order.id, status: "PENDING_CONFIGURATION", redirectUrl: `/checkout/gracias/${order.id}?configuracion=pendiente&t=${signPublicToken(order.id)}` });
  const clientTransactionId = `silho-${order.id}`;
  const payment = await db.payment.create({ data: { orderId: order.id, provider: provider.name, clientTransactionId, amount: breakdown.discounted, status: "PENDING" } });
  try {
    const result = await provider.createPayment({ orderId: order.id, amount: breakdown.discounted, currency: "USD", clientTransactionId, description: service.name, customer: { name: `${input.nombre} ${input.apellido ?? ""}`.trim(), email: input.email || undefined, phone } });
    if (result.providerRef) await db.payment.update({ where: { id: payment.id }, data: { providerTransactionId: result.providerRef } });
    if (result.status === "REJECTED" || result.status === "CANCELLED" || result.status === "ERROR") await markOrderFailed(order.id);
    return NextResponse.json({ orderId: order.id, status: result.status, redirectUrl: result.redirectUrl ?? `/checkout/gracias/${order.id}?t=${signPublicToken(order.id)}` });
  } catch {
    await db.payment.update({ where: { id: payment.id }, data: { status: "ERROR" } });
    await markOrderFailed(order.id);
    return NextResponse.json({ error: "No pudimos iniciar el pago en este momento." }, { status: 502 });
  }
}
