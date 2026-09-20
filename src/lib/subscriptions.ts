import { randomUUID } from "node:crypto";
import type { Prisma, SubscriptionPaymentKind, SubscriptionStatus } from "@prisma/client";
import { db } from "./db";
import { getPaymentProvider } from "./payments";
import type { PaymentProviderStatus } from "./payments/types";
import { toPaymentStatus } from "./payments/status";
import { encryptCardHolder } from "./payments/payphone-crypto";
import { awardPoints } from "./rewards";
import { getSetting } from "./settings";
import { sendEmail } from "./notifications";

export function addMonth(date: Date) {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + 1);
  result.setDate(Math.min(day, new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()));
  return result;
}

export type SubscriptionStateInput = { status: SubscriptionStatus; failedAttempts: number };

export function nextSubscriptionState(current: SubscriptionStateInput, kind: SubscriptionPaymentKind, status: PaymentProviderStatus) {
  if (status === "APPROVED") return { status: "ACTIVE" as const, failedAttempts: 0, nextBillingDelta: "MONTH" as const };
  if (status === "PENDING" || status === "PENDING_CONFIGURATION") return { status: current.status, failedAttempts: current.failedAttempts, nextBillingDelta: null };
  if (kind === "INITIAL") return { status: "CANCELLED" as const, failedAttempts: current.failedAttempts + 1, cancelReason: "Pago inicial no aprobado", nextBillingDelta: null };
  const failedAttempts = current.failedAttempts + 1;
  if (failedAttempts >= 3) return { status: "CANCELLED" as const, failedAttempts, cancelReason: "3 intentos de cobro fallidos", nextBillingDelta: null };
  return { status: "PAST_DUE" as const, failedAttempts, nextBillingDelta: 2 as const };
}

function serializable(raw: unknown) {
  return JSON.parse(JSON.stringify(raw)) as Prisma.InputJsonValue;
}

export async function startSubscription({ patientId, planId, consent }: { patientId: string; planId: string; consent: { ip: string; text: string; termsVersion: string } }) {
  const [patient, plan, duplicate] = await Promise.all([
    db.patient.findUniqueOrThrow({ where: { id: patientId } }),
    db.subscriptionPlan.findUnique({ where: { id: planId, active: true } }),
    db.subscription.findFirst({ where: { patientId, planId, status: { in: ["ACTIVE", "PENDING", "PAST_DUE"] } } }),
  ]);
  if (!plan) throw new Error("El programa no está disponible.");
  if (duplicate) throw new Error("Ya tiene este programa activo");
  const now = new Date();
  const periodEnd = addMonth(now);
  const clientTransactionId = `SUB-${randomUUID()}`;
  const subscription = await db.$transaction(async (tx) => {
    const created = await tx.subscription.create({
      data: {
        patientId,
        planId,
        status: "PENDING",
        provider: "payphone",
        consentAt: now,
        consentIp: consent.ip,
        consentText: consent.text,
        termsVersion: consent.termsVersion,
        payments: { create: { kind: "INITIAL", provider: "payphone", clientTransactionId, amount: plan.price, periodStart: now, periodEnd } },
      },
    });
    return created;
  });
  const provider = getPaymentProvider("payphone");
  if (!provider) throw new Error("Proveedor de pago no disponible.");
  const payment = await provider.createPayment({ orderId: subscription.id, amount: Number(plan.price), currency: "USD", clientTransactionId, description: plan.name, customer: { name: `${patient.firstName} ${patient.lastName}`, email: patient.email, phone: patient.phone } });
  await db.subscriptionPayment.update({ where: { clientTransactionId }, data: { providerTransactionId: payment.providerRef || null } });
  return { redirectUrl: payment.redirectUrl, status: payment.status, clientTransactionId };
}

export async function settleSubscriptionPayment({ clientTransactionId, providerTransactionId, status, raw, ctoken }: { clientTransactionId: string; providerTransactionId?: string; status: PaymentProviderStatus; raw: unknown; ctoken?: string }) {
  const result = await db.$transaction(async (tx) => {
    const payment = await tx.subscriptionPayment.findUnique({ where: { clientTransactionId }, include: { subscription: { include: { plan: true, patient: true } } } });
    if (!payment) throw new Error("Pago de suscripción no encontrado.");
    const paymentStatus = toPaymentStatus(status);
    const claimed = await tx.subscriptionPayment.updateMany({ where: { id: payment.id, status: { not: "APPROVED" } }, data: { status: paymentStatus, providerTransactionId: providerTransactionId || payment.providerTransactionId, rawResponse: serializable(raw) } });
    if (claimed.count === 0) return { payment, changed: false, status: paymentStatus };
    const next = nextSubscriptionState(payment.subscription, payment.kind, status);
    const subscriptionData: Prisma.SubscriptionUpdateInput = { status: next.status, failedAttempts: next.failedAttempts };
    if (next.nextBillingDelta === "MONTH") {
      subscriptionData.lastBillingDate = new Date();
      subscriptionData.nextBillingDate = payment.periodEnd;
      if (payment.kind === "INITIAL") subscriptionData.startDate = new Date();
      if (ctoken) subscriptionData.providerToken = ctoken;
      const rawRecord = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
      const holder = rawRecord.optionalParameter4;
      if (typeof holder === "string" && process.env.PAYPHONE_CODING_PASSWORD) {
        try { subscriptionData.cardHolderEnc = encryptCardHolder(holder); } catch { /* optional metadata must not block settlement */ }
      }
      subscriptionData.cardBrand = typeof rawRecord.cardBrand === "string" ? rawRecord.cardBrand : null;
      subscriptionData.cardLast4 = typeof rawRecord.lastDigits === "string" ? rawRecord.lastDigits : null;
      const pointsPerUsd = Number(await getSetting("REWARDS_POINTS_PER_USD", "1"));
      await awardPoints(tx, { patientId: payment.subscription.patientId, points: Math.round(Number(payment.amount) * pointsPerUsd), reason: "WEB_BOOKING_PAID", description: `Mensualidad ${payment.subscription.plan.name}` });
    } else if (next.status === "PAST_DUE") {
      subscriptionData.nextBillingDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    } else if (next.status === "CANCELLED") {
      subscriptionData.cancelledAt = new Date();
      subscriptionData.cancelReason = next.cancelReason;
      if (payment.kind === "RECURRING") subscriptionData.providerToken = null;
    }
    await tx.subscription.update({ where: { id: payment.subscriptionId }, data: subscriptionData });
    return { notifyEmail: payment.subscription.patient.email, planName: payment.subscription.plan.name, changed: true, status: paymentStatus };
  });
  if (result.changed && result.notifyEmail) {
    const approved = result.status === "APPROVED";
    await sendEmail({
      to: result.notifyEmail,
      subject: approved ? "Mensualidad SILHO aprobada" : "No pudimos procesar su mensualidad SILHO",
      html: approved
        ? `<p>Su mensualidad de ${result.planName} fue aprobada.</p>`
        : `<p>No pudimos procesar su mensualidad de ${result.planName}. Revise su cuenta SILHO para continuar.</p>`,
    });
  }
  return result;
}

export async function cancelSubscription(subscriptionId: string, patientId: string, reason = "Cancelada por el paciente") {
  return db.subscription.update({ where: { id: subscriptionId, patientId }, data: { status: "CANCELLED", cancelledAt: new Date(), cancelReason: reason, providerToken: null, cardHolderEnc: null } });
}

export async function runRecurringBilling(now = new Date()) {
  const provider = getPaymentProvider("payphone");
  const subscriptions = await db.subscription.findMany({ where: { status: { in: ["ACTIVE", "PAST_DUE"] }, nextBillingDate: { lte: now } }, include: { patient: true, plan: true } });
  const summary = { charged: 0, failed: 0, skipped: 0 };
  for (const subscription of subscriptions) {
    if (!subscription.providerToken || !subscription.cardHolderEnc) {
      await db.subscription.update({ where: { id: subscription.id }, data: { status: "PAST_DUE", nextBillingDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } });
      if (subscription.patient.email) await sendEmail({ to: subscription.patient.email, subject: "Actualice su programa SILHO", html: "<p>No pudimos renovar su programa. Ingrese a su cuenta para reactivar el cobro.</p>" });
      summary.skipped++;
      continue;
    }
    if (!provider?.isConfigured() || !provider.chargeToken) {
      summary.skipped++;
      continue;
    }
    const periodStart = subscription.nextBillingDate ?? now;
    const periodEnd = addMonth(periodStart);
    const clientTransactionId = `SUB-${randomUUID()}`;
    await db.subscriptionPayment.create({ data: { subscriptionId: subscription.id, kind: "RECURRING", provider: "payphone", clientTransactionId, amount: subscription.plan.price, periodStart, periodEnd } });
    const charge = await provider.chargeToken({ cardToken: subscription.providerToken, cardHolderEnc: subscription.cardHolderEnc, documentId: subscription.patient.documentId, phoneNumber: subscription.patient.phone.replace(/\D/g, ""), email: subscription.patient.email, amount: Number(subscription.plan.price), currency: "USD", clientTransactionId, description: subscription.plan.name });
    const settled = await settleSubscriptionPayment({ clientTransactionId, providerTransactionId: charge.providerTransactionId, status: charge.status, raw: charge.raw });
    if (settled.status === "APPROVED") summary.charged++;
    else if (settled.status === "REJECTED" || settled.status === "CANCELLED" || settled.status === "ERROR") summary.failed++;
    else summary.skipped++;
  }
  return summary;
}
