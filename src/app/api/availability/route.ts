import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { zonedDateToUtc, formatInClinicTz } from "@/lib/time";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const locationId = params.get("locationId");
  const date = params.get("date");
  if (!locationId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Sede y fecha son obligatorias." }, { status: 400 });
  const dayStart = zonedDateToUtc(date, "00:00");
  const dayEnd = zonedDateToUtc(date, "23:59");
  const appointments = await db.appointment.findMany({ where: { locationId, date: { gte: dayStart, lte: dayEnd }, status: { not: "CANCELLED" } }, select: { date: true } });
  return NextResponse.json({ occupied: appointments.map((appointment) => formatInClinicTz(appointment.date, { hour: "2-digit", minute: "2-digit", hour12: false })) });
}
