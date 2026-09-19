import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { appointmentSchema } from "@/lib/validation/appointment";

export async function POST(request: Request) {
  const result = rateLimit(`appointment:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 10);
  if (!result.success) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const parsed = appointmentSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
  const { firstName, lastName, documentId, email, phone, city, time, acceptPrivacy: _acceptPrivacy, ...appointmentData } = parsed.data;
  void _acceptPrivacy;
  const date = new Date(appointmentData.date);
  const [hours, minutes] = time.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0);
  const appointment = await db.$transaction(async (tx) => {
    const patient = await tx.patient.upsert({
      where: { documentId },
      update: { firstName, lastName, email, phone, city },
      create: { firstName, lastName, documentId, email, phone, city },
    });
    const created = await tx.appointment.create({ data: { ...appointmentData, date, patientId: patient.id } });
    await tx.lead.create({
      data: {
        name: `${firstName} ${lastName}`,
        phone,
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
