import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/notifications";
import { allocateExpirations } from "@/lib/rewards";

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!expected || authorization !== `Bearer ${expected}`) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const now = new Date();
  const expiring = await db.pointsTransaction.findMany({ where: { points: { gt: 0 }, expiresAt: { not: null, lte: now }, expiredHandled: false }, select: { patientId: true } });
  const patientIds = [...new Set(expiring.map((transaction) => transaction.patientId))];
  for (const patientId of patientIds) {
    await db.$transaction(async (tx) => {
      const transactions = await tx.pointsTransaction.findMany({ where: { patientId }, orderBy: { expiresAt: "asc" } });
      const allocation = allocateExpirations(transactions);
      for (const item of allocation.expired) {
        const claimed = await tx.pointsTransaction.updateMany({ where: { id: item.id, expiredHandled: false }, data: { expiredHandled: true } });
        if (claimed.count === 0) continue;
        const source = transactions.find((transaction) => transaction.id === item.id);
        if (!source) continue;
        await tx.pointsTransaction.create({ data: { patientId, points: -item.remainder, reason: "EXPIRED", description: "Puntos vencidos", appointmentId: source.appointmentId, orderId: source.orderId } });
      }
    });
  }
  const soon = new Date(now);
  soon.setDate(soon.getDate() + 30);
  const patients = await db.patient.findMany({ where: { account: { isNot: null }, email: { not: "" }, points: { some: { points: { gt: 0 }, expiresAt: { gt: now, lte: soon }, expiredHandled: false } } }, select: { email: true, points: true } });
  const emails = [...new Set(patients.filter((patient) => allocateExpirations(patient.points).expiringSoon.some((grant) => grant.expiresAt <= soon)).map((patient) => patient.email).filter(Boolean))];
  await Promise.all(emails.map((email) => sendEmail({ to: email, subject: "Sus puntos SILHO están por vencer", html: "<p>Algunos puntos de su cuenta SILHO vencerán en los próximos 30 días. Ingrese a su cuenta para consultar el detalle.</p>" })));
  return NextResponse.json({ expired: expiring.length, notified: emails.length });
}
