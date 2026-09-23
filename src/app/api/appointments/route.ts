import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { appointmentSchema } from "@/lib/validation/appointment";
import { zonedDateToUtc } from "@/lib/time";
import { normalizePhone } from "@/lib/phone";

export async function POST(request: Request) {
  const result = rateLimit(`appointment:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 10);
  if (!result.success) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const parsed = appointmentSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
  const { firstName, lastName, documentId, email, phone, city, time, acceptPrivacy: _acceptPrivacy, ...appointmentData } = parsed.data;
  void _acceptPrivacy;
  const canonicalPhone = normalizePhone(phone);
  if (canonicalPhone.length < 7) return NextResponse.json({ error: "Ingrese un número de WhatsApp válido." }, { status: 400 });
  const date = zonedDateToUtc(appointmentData.date.toISOString().slice(0, 10), time);
  const appointment = await db.$transaction(async (tx) => {
    const patient = await tx.patient.upsert({
      where: { documentId },
      update: { phone: canonicalPhone },
      create: { firstName, lastName, documentId, email, phone: canonicalPhone, city },
    });
    const created = await tx.appointment.create({ data: { ...appointmentData, date, patientId: patient.id } });
    await tx.lead.create({
      data: {
        name: `${firstName} ${lastName}`,
        phone: canonicalPhone,
        email,
        interestedService: appointmentData.serviceId,
        source: "WEB",
        status: "APPOINTMENT",
        notes: `Solicitud de cita para ${date.toISOString()}`,
      },
    });
    return created;
  });
  return NextResponse.json({ id: appointment.id }, { status: 201 });
}
