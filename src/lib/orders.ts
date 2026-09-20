import { db } from "./db";
import { awardPoints } from "./rewards";
import { getSetting } from "./settings";

export async function markOrderPaid(orderId: string) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { service: true, patient: { include: { account: true } } },
    });
    if (!order) throw new Error("Orden no encontrada.");
    if (order.status === "PAID") return order;

    const paidOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID", paidAt: new Date() },
      include: { service: true, patient: { include: { account: true } } },
    });
    const account = order.patient.account;
    if (!account) return paidOrder;

    const pointsPerUsd = Number(await getSetting("REWARDS_POINTS_PER_USD", "1"));
    await awardPoints(tx, {
      patientId: order.patientId,
      points: Math.round(Math.round(Number(order.total)) * pointsPerUsd),
      reason: "WEB_BOOKING_PAID",
      description: `Pago en línea: ${order.service.name}`,
      orderId: order.id,
    });

    if (order.referralCode) {
      const previousPaidOrders = await tx.order.count({
        where: { patientId: order.patientId, status: "PAID", id: { not: order.id } },
      });
      if (previousPaidOrders === 0) {
        const referrer = await tx.patientAccount.findUnique({ where: { referralCode: order.referralCode } });
        if (referrer && referrer.patientId !== order.patientId) {
          await awardPoints(tx, {
            patientId: referrer.patientId,
            points: 200,
            reason: "REFERRAL",
            description: "Referido que completó su primer pago en línea.",
            orderId: order.id,
          });
          if (!account.referredById) {
            await tx.patientAccount.update({ where: { id: account.id }, data: { referredById: referrer.id } });
          }
        }
      }
    }
    return paidOrder;
  });
}
