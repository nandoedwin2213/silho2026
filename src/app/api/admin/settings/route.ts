import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json() as { discount: number; whatsapp?: string; instagram?: string; tiktok?: string; facebook?: string; surgical?: boolean; email?: string; instructions?: string };
  if (!Number.isFinite(body.discount) || body.discount < 0 || body.discount > 50) return NextResponse.json({ error: "Descuento inválido" }, { status: 400 });
  const values = { PRONTO_PAGO_DISCOUNT: String(body.discount), WHATSAPP_NUMBER: body.whatsapp ?? "", INSTAGRAM_URL: body.instagram ?? "", TIKTOK_URL: body.tiktok ?? "", FACEBOOK_URL: body.facebook ?? "", SHOW_SURGICAL_PRICES: String(body.surgical ?? false), CLINIC_EMAIL: body.email ?? "", BANK_TRANSFER_INSTRUCTIONS: body.instructions ?? "" };
  for (const [key, value] of Object.entries(values)) await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
