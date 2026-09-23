import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { leadSchema } from "@/lib/validation/lead";
import { normalizePhone } from "@/lib/phone";

export async function POST(request: Request) {
  const result = rateLimit(`lead:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 10);
  if (!result.success) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const parsed = leadSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
  const phone = normalizePhone(parsed.data.phone);
  if (phone.length < 7) return NextResponse.json({ error: "Ingrese un número de WhatsApp válido." }, { status: 400 });
  const lead = await db.lead.create({ data: { ...parsed.data, phone } });
  return NextResponse.json({ id: lead.id }, { status: 201 });
}
