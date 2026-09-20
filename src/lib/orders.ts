import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { awardPoints } from "./rewards";
import { getSetting } from "./settings";

export async function markOrderPaid(orderId: string) {
  return db.$transaction(async (tx) => {
    const claimed = await tx.order.updateMany({
      where: { id: orderId, status: { not: "PAID" } },
      data: { status: "PAID", paidAt: new Date() },
    });
    if (claimed.count === 0) {
      const alreadyPaid = await tx.order.findUnique({
        where: { id: orderId },
        include: { service: true, patient: { include: { account: true } } },
      });
      if (!alreadyPaid) throw new Error("Orden no encontrada.");
      return alreadyPaid;
    }

    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { service: true, patient: { include: { account: true } } },
    });
    if (!order) throw new Error("Orden no encontrada.");
    const account = order.patient.account;
    if (!account) return order;

    const pointsPerUsd = Number(await getSetting("REWARDS_POINTS_PER_USD", "1"));
    const existingBookingAward = await tx.pointsTransaction.findFirst({
      where: { orderId, reason: "WEB_BOOKING_PAID", patientId: order.patientId },
    });
    if (!existingBookingAward) {
      await awardPoints(tx, {
        patientId: order.patientId,
        points: Math.round(Math.round(Number(order.total)) * pointsPerUsd),
        reason: "WEB_BOOKING_PAID",
        description: `Pago en línea: ${order.service.name}`,
        orderId: order.id,
      });
    }

    const referralCode = order.referralCode ?? null;
    const referrer = referralCode
      ? await tx.patientAccount.findUnique({ where: { referralCode } })
      : account.referredById
        ? await tx.patientAccount.findUnique({ where: { id: account.referredById } })
        : null;
    if (referrer && referrer.patientId !== order.patientId) {
      const previousPaidOrders = await tx.order.count({
        where: { patientId: order.patientId, status: "PAID", id: { not: order.id } },
      });
      if (previousPaidOrders === 0) {
        const existingReferralAward = await tx.pointsTransaction.findFirst({
          where: { orderId, reason: "REFERRAL", patientId: referrer.patientId },
        });
        if (!existingReferralAward) {
          await awardPoints(tx, {
            patientId: referrer.patientId,
            points: 200,
            reason: "REFERRAL",
            description: "Referido que completó su primer pago en línea.",
            orderId: order.id,
          });
        }
        if (!account.referredById) {
          await tx.patientAccount.update({ where: { id: account.id }, data: { referredById: referrer.id } });
        }
      }
    }
    return order;
  });
}

export async function reverseOrderRedemption(tx: Prisma.TransactionClient, orderId: string) {
  const order = await tx.order.findUnique({ where: { id: orderId } });
  if (!order || order.pointsRedeemed <= 0) return;
  const existing = await tx.pointsTransaction.findFirst({
    where: { orderId, reason: "ADJUSTMENT", points: { gt: 0 } },
  });
  if (existing) return;
  await awardPoints(tx, {
    patientId: order.patientId,
    points: order.pointsRedeemed,
    reason: "ADJUSTMENT",
    description: "Devolución de puntos por orden cancelada",
    orderId,
  });
}

export async function markOrderFailed(orderId: string) {
  return db.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({ where: { id: orderId, status: { not: "PAID" } }, data: { status: "FAILED" } });
    if (updated.count > 0) await reverseOrderRedemption(tx, orderId);
    return tx.order.findUnique({ where: { id: orderId } });
  });
}
