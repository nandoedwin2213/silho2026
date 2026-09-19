import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { appointmentSchema } from "@/lib/validation/appointment";

export async function POST(request: Request) {
  const result = rateLimit(`appointment:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 10);
  if (!result.success) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const parsed = appointmentSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
  const appointment = await db.appointment.create({ data: parsed.data });
  return NextResponse.json({ id: appointment.id }, { status: 201 });
}
