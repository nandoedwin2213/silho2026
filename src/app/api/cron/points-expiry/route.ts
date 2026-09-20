import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/notifications";

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!expected || authorization !== `Bearer ${expected}`) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const now = new Date();
  const expiring = await db.pointsTransaction.findMany({ where: { points: { gt: 0 }, expiresAt: { not: null, lte: now }, expiredHandled: false }, select: { id: true, patientId: true, points: true } });
  for (const transaction of expiring) {
    await db.$transaction(async (tx) => {
      const current = await tx.pointsTransaction.findUnique({ where: { id: transaction.id } });
      if (!current || current.expiredHandled || current.points <= 0) return;
      await tx.pointsTransaction.create({ data: { patientId: current.patientId, points: -current.points, reason: "EXPIRED", description: "Puntos vencidos", appointmentId: current.appointmentId, orderId: current.orderId } });
      await tx.pointsTransaction.update({ where: { id: current.id }, data: { expiredHandled: true } });
    });
  }
  const soon = new Date(now);
  soon.setDate(soon.getDate() + 30);
  const patients = await db.patient.findMany({ where: { account: { isNot: null }, email: { not: "" }, points: { some: { points: { gt: 0 }, expiresAt: { gt: now, lte: soon }, expiredHandled: false } } }, select: { email: true } });
  const emails = [...new Set(patients.map((patient) => patient.email).filter(Boolean))];
  await Promise.all(emails.map((email) => sendEmail({ to: email, subject: "Sus puntos SILHO están por vencer", html: "<p>Algunos puntos de su cuenta SILHO vencerán en los próximos 30 días. Ingrese a su cuenta para consultar el detalle.</p>" })));
  return NextResponse.json({ expired: expiring.length, notified: emails.length });
}
