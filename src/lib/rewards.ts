import { randomBytes } from "node:crypto";
import type { Prisma, PointsReason, RewardTier } from "@prisma/client";
import { db } from "./db";
import { getSetting } from "./settings";

export type PointsLedgerTransaction = {
  id: string;
  points: number;
  expiresAt: Date | null;
  expiredHandled?: boolean;
  createdAt?: Date;
};

export function allocateExpirations(transactions: PointsLedgerTransaction[], now = new Date()) {
  const soon = new Date(now);
  soon.setDate(soon.getDate() + 60);
  const grants = transactions
    .filter((transaction) => transaction.points > 0)
    .sort((a, b) => {
      if (!a.expiresAt && !b.expiresAt) return (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0);
      if (!a.expiresAt) return 1;
      if (!b.expiresAt) return -1;
      return a.expiresAt.getTime() - b.expiresAt.getTime();
    });
  let remainingNegative = Math.abs(transactions.filter((transaction) => transaction.points < 0).reduce((sum, transaction) => sum + transaction.points, 0));
  const expired: { id: string; remainder: number }[] = [];
  const expiringSoon: { id: string; points: number; expiresAt: Date }[] = [];

  for (const grant of grants) {
    const consumed = Math.min(grant.points, remainingNegative);
    remainingNegative -= consumed;
    const remainder = grant.points - consumed;
    if (remainder <= 0) continue;
    if (grant.expiresAt && grant.expiresAt <= now && !grant.expiredHandled) expired.push({ id: grant.id, remainder });
    if (grant.expiresAt && grant.expiresAt > now && grant.expiresAt <= soon && !grant.expiredHandled) {
      expiringSoon.push({ id: grant.id, points: remainder, expiresAt: grant.expiresAt });
    }
  }

  return {
    expired,
    balance: transactions.reduce((sum, transaction) => sum + transaction.points, 0) - expired.reduce((sum, transaction) => sum + transaction.remainder, 0),
    expiringSoon,
  };
}

export async function getPointsBalance(client: Pick<Prisma.TransactionClient, "pointsTransaction">, patientId: string) {
  const transactions = await client.pointsTransaction.findMany({ where: { patientId }, select: { points: true } });
  return transactions.reduce((sum, transaction) => sum + transaction.points, 0);
}

export const TIERS: { tier: RewardTier; min: number; benefits: string[] }[] = [
  { tier: "ESSENTIAL", min: 0, benefits: ["Acumular puntos por acciones elegibles", "Acceder a recompensas disponibles"] },
  { tier: "GOLD", min: 500, benefits: ["Beneficios de Essential", "Acceso a beneficios de protocolos seleccionados"] },
  { tier: "BLACK", min: 1500, benefits: ["Beneficios de Gold", "Acceso anticipado a campañas y cupos especiales"] },
];

export const EARN_RULES = [
  { reason: "WEB_BOOKING_PAID" as const, label: "Reservar y pagar por la página", points: "1 punto por USD" },
  { reason: "PROTOCOL_COMPLETED" as const, points: 150 },
  { reason: "PUNCTUAL_ATTENDANCE" as const, points: 25 },
  { reason: "REFERRAL" as const, points: 200 },
  { reason: "FOLLOW_UP" as const, points: 50 },
  { reason: "ANNIVERSARY" as const, points: 100 },
];

export function pointsToUsd(points: number, valueUsd: number) {
  return Math.max(0, Math.round(points * valueUsd * 100) / 100);
}

export function computeMaxRedeemable(balance: number, total: number, maxPct: number, valueUsd: number) {
  if (balance <= 0 || total <= 0 || maxPct <= 0 || valueUsd <= 0) return 0;
  const maxDiscount = total * (maxPct / 100);
  const maxPoints = Math.floor(maxDiscount / valueUsd);
  return Math.max(0, Math.min(Math.floor(balance / 100) * 100, Math.floor(maxPoints / 100) * 100));
}

export async function getPointsSummary(patientId: string) {
  const now = new Date();
  const yearAgo = new Date(now);
  yearAgo.setMonth(yearAgo.getMonth() - 12);
  const transactions = await db.pointsTransaction.findMany({
    where: { patientId },
    orderBy: { expiresAt: "asc" },
  });
  const allocation = allocateExpirations(transactions);
  const balance = transactions.reduce((sum, transaction) => sum + transaction.points, 0);
  const earned12m = transactions.reduce(
    (sum, transaction) => sum + (transaction.createdAt >= yearAgo && transaction.points > 0 ? transaction.points : 0),
    0,
  );
  const tier = [...TIERS].reverse().find((entry) => earned12m >= entry.min)?.tier ?? "ESSENTIAL";
  const next = TIERS.find((entry) => entry.min > earned12m);
  const expiringSoon = allocation.expiringSoon.map(({ points, expiresAt }) => ({ points, expiresAt }));

  return { balance, earned12m, tier, ...(next ? { nextTier: { tier: next.tier, missing: next.min - earned12m } } : {}), expiringSoon };
}

export async function awardPoints(
  tx: Prisma.TransactionClient,
  {
    patientId,
    points,
    reason,
    description,
    orderId,
    appointmentId,
  }: {
    patientId: string;
    points: number;
    reason: PointsReason;
    description: string;
    orderId?: string;
    appointmentId?: string;
  },
) {
  const expiryMonths = Number(await getSetting("REWARDS_EXPIRY_MONTHS", "12"));
  const expiresAt = points > 0 ? new Date() : null;
  if (expiresAt) expiresAt.setMonth(expiresAt.getMonth() + expiryMonths);
  return tx.pointsTransaction.create({
    data: { patientId, points, reason, description, orderId, appointmentId, expiresAt },
  });
}

export async function maxRedeemablePoints(patientId: string, orderTotal: number) {
  const [{ balance }, maxPct, valueUsd] = await Promise.all([
    getPointsSummary(patientId),
    getSetting("REWARDS_MAX_REDEEM_PERCENT", "20"),
    getSetting("REWARDS_POINT_VALUE_USD", "0.05"),
  ]);
  return computeMaxRedeemable(balance, orderTotal, Number(maxPct), Number(valueUsd));
}

export function generateReferralCode(firstName: string) {
  const prefix = firstName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase() || "SILH";
  return `${prefix}-${randomBytes(4).toString("hex").toUpperCase()}`;
}
