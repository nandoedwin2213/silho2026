import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPatientSession } from "@/lib/patient-auth";
import { getPaymentProvider } from "@/lib/payments";
import { getWebDiscountFor, priceBreakdown } from "@/lib/pricing";
import { computeMaxRedeemable, getPointsBalance, pointsToUsd } from "@/lib/rewards";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/notifications";
import { zonedDateToUtc } from "@/lib/time";
import { getSettings, getSetting } from "@/lib/settings";
import { bookingSchema } from "@/lib/validation/booking";
import { routes } from "@/lib/routes";
import { signPublicToken } from "@/lib/public-token";
import { markOrderFailed } from "@/lib/orders";
import { normalizePhone } from "@/lib/phone";

class BookingConflictError extends Error {}
class BookingValidationError extends Error {}

function localDateIsValid(date: string) {
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.getUTCDay() === 0) return false;
  const today = new Date();
  const todayString = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Guayaquil", year: "numeric", month: "2-digit", day: "2-digit" }).format(today);
  const max = new Date(`${todayString}T12:00:00Z`);
  max.setUTCDate(max.getUTCDate() + 60);
  return parsed >= new Date(`${todayString}T00:00:00Z`) && parsed <= max;
}

export async function POST(request: Request) {
  const limited = rateLimit(`booking:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 10);
  if (!limited.success) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const parsed = bookingSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;
  const rawPhone = input.phone.trim();
  const phone = normalizePhone(rawPhone);
  if (phone.length < 7) return NextResponse.json({ error: "Ingrese un número de WhatsApp válido." }, { status: 400 });
  if (input.pointsRedeemed % 100 !== 0) return NextResponse.json({ error: "La cantidad de puntos no es válida." }, { status: 400 });
  if (input.objective && !routes[input.objective]) return NextResponse.json({ error: "La ruta facial no es válida." }, { status: 400 });
  if (!localDateIsValid(input.date)) return NextResponse.json({ error: "Seleccione un día entre hoy y los próximos 60 días, excepto domingos." }, { status: 400 });
  const session = await getPatientSession();
  const settings = await getSettings(["ASSESSMENT_SERVICE_SLUG", "REWARDS_MAX_REDEEM_PERCENT", "REWARDS_POINT_VALUE_USD"]);
  const assessmentSlug = settings.ASSESSMENT_SERVICE_SLUG ?? "valoracion-valoracion-estetica-facial";
  const [service, location, professional, valueUsd] = await Promise.all([
    db.service.findFirst({ where: { slug: assessmentSlug, active: true } }),
    db.location.findFirst({ where: { id: input.locationId, active: true } }),
    db.professional.findFirst({ where: { active: true }, orderBy: { name: "asc" } }),
    getSetting("REWARDS_POINT_VALUE_USD", "0.05"),
  ]);
  if (!service || !location || !professional) return NextResponse.json({ error: "No pudimos preparar la reserva con los datos actuales." }, { status: 400 });
  const appointmentDate = zonedDateToUtc(input.date, input.time);
  const webDiscount = input.paymentMethod === "PAYPHONE" ? await getWebDiscountFor(service) : 0;
  let result;
  try {
    result = await db.$transaction(async (tx) => {
    const collision = await tx.appointment.findFirst({ where: { locationId: input.locationId, date: appointmentDate, status: { not: "CANCELLED" } }, select: { id: true } });
    if (collision) throw new BookingConflictError("Ese horario acaba de ocuparse");

    let patient;
    if (session) {
      patient = await tx.patient.findUnique({ where: { id: session.patientId } });
      if (!patient) throw new BookingValidationError("La sesión de paciente no es válida.");
    } else {
      patient = await tx.patient.findUnique({ where: { documentId: input.documentId } });
      if (!patient) {
        patient = await tx.patient.create({ data: { firstName: input.firstName, lastName: input.lastName, documentId: input.documentId, email: input.email, phone, city: input.city } });
      } else {
        const updates: { email?: string; phone?: string; city?: string } = {};
        if (!patient.email) updates.email = input.email;
        if (normalizePhone(patient.phone) === phone && patient.phone !== phone) updates.phone = phone;
        if (!patient.city) updates.city = input.city;
        if (Object.keys(updates).length > 0) patient = await tx.patient.update({ where: { id: patient.id }, data: updates });
      }
    }
    if (input.referralCode) {
      const referrer = await tx.patientAccount.findUnique({ where: { referralCode: input.referralCode.toUpperCase() } });
      if (!referrer || referrer.patientId === patient.id) throw new BookingValidationError("El código de referido no es válido.");
    }
    const balance = await getPointsBalance(tx, patient.id);
    const maxPercent = Number(settings.REWARDS_MAX_REDEEM_PERCENT ?? "20");
    const requestedPoints = input.pointsRedeemed;
    if (requestedPoints % 100 !== 0) throw new BookingValidationError("La cantidad de puntos no es válida.");
    if (requestedPoints > 0 && (!session || requestedPoints > Math.floor(balance / 100) * 100)) throw new BookingValidationError("La cantidad de puntos no es válida para esta reserva.");
    const preview = priceBreakdown(Number(service.basePrice), webDiscount, service.discountEligible, 0);
    const maxPoints = computeMaxRedeemable(balance, preview.discounted, maxPercent, Number(valueUsd));
    if (requestedPoints > maxPoints) throw new BookingValidationError("La cantidad de puntos supera el máximo permitido para esta reserva.");
    const pointsDiscount = pointsToUsd(requestedPoints, Number(valueUsd));
    const breakdown = priceBreakdown(Number(service.basePrice), webDiscount, service.discountEligible, pointsDiscount);
    const appointment = await tx.appointment.create({ data: { patientId: patient.id, serviceId: service.id, locationId: location.id, professionalId: professional.id, date: appointmentDate, status: "PENDING", objective: input.objective, intake: input.intake, promoCode: input.referralCode } });
    const order = await tx.order.create({ data: { patientId: patient.id, serviceId: service.id, appointmentId: appointment.id, basePrice: breakdown.base, discountPercent: breakdown.discountPercent, discountAmount: breakdown.base - breakdown.discounted, pointsRedeemed: requestedPoints, pointsDiscount, referralCode: input.referralCode?.toUpperCase(), total: breakdown.discounted, paymentMethod: input.paymentMethod, acceptedTerms: input.acceptTerms, channel: "WEB" } });
    if (requestedPoints > 0) await tx.pointsTransaction.create({ data: { patientId: patient.id, points: -requestedPoints, reason: "REDEMPTION", description: `Canje aplicado a la reserva ${appointment.id}`, orderId: order.id, appointmentId: appointment.id } });
    await tx.lead.create({ data: { name: `${input.firstName} ${input.lastName}`, phone, email: input.email, interestedService: service.name, source: input.referralCode ? "REFERRAL" : "WEB", status: "APPOINTMENT", notes: `Reserva facial ${appointment.id}` } });
    return { appointment, order, patient };
    });
  } catch (error) {
    if (error instanceof BookingConflictError) return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof BookingValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return NextResponse.json({ error: "Ese horario acaba de ocuparse" }, { status: 409 });
    throw error;
  }

  let status = "PENDING";
  let redirectUrl = `/reservar/gracias/${result.appointment.id}?pago=pendiente&t=${signPublicToken(result.appointment.id)}`;
  if (input.paymentMethod === "PAYPHONE") {
    const provider = getPaymentProvider("payphone");
    if (!provider) status = "PENDING_CONFIGURATION";
    else {
      const clientTransactionId = `silho-${result.order.id}`;
      const payment = await db.payment.create({ data: { orderId: result.order.id, provider: provider.name, clientTransactionId, amount: result.order.total, status: "PENDING" } });
      try {
        const created = await provider.createPayment({ orderId: result.order.id, amount: Number(result.order.total), currency: "USD", clientTransactionId, description: service.name, customer: { name: `${input.firstName} ${input.lastName}`, email: input.email, phone } });
        if (created.providerRef) await db.payment.update({ where: { id: payment.id }, data: { providerTransactionId: created.providerRef } });
        status = created.status;
        if (created.status === "REJECTED" || created.status === "CANCELLED" || created.status === "ERROR") await markOrderFailed(result.order.id);
        if (created.redirectUrl) redirectUrl = created.redirectUrl;
      } catch {
        await db.payment.update({ where: { id: payment.id }, data: { status: "ERROR" } });
        await markOrderFailed(result.order.id);
        status = "ERROR";
      }
    }
  }
  await sendEmail({ to: input.email, subject: "Solicitud de reserva SILHO", html: `<p>Recibimos su solicitud de valoración facial para el ${input.date} a las ${input.time}.</p>` });
  return NextResponse.json({ appointmentId: result.appointment.id, orderId: result.order.id, status, redirectUrl }, { status: 201 });
}
