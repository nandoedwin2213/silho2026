import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json() as { discount: number; webAssessmentDiscount?: string; webTreatmentBonus?: string; webBonusDays?: string; webOfferUntil?: string; rewardsPerUsd?: string; rewardsPointValue?: string; rewardsMaxRedeem?: string; rewardsExpiryMonths?: string; clinicHours?: string; whatsapp?: string; instagram?: string; tiktok?: string; facebook?: string; surgical?: boolean; email?: string; instructions?: string };
  if (!Number.isFinite(body.discount) || body.discount < 0 || body.discount > 50) return NextResponse.json({ error: "Descuento inválido" }, { status: 400 });
  const values = { PRONTO_PAGO_DISCOUNT: String(body.discount), WEB_ASSESSMENT_DISCOUNT: body.webAssessmentDiscount ?? String(body.discount), WEB_TREATMENT_BONUS_USD: body.webTreatmentBonus ?? "50", WEB_BONUS_DAYS: body.webBonusDays ?? "30", WEB_OFFER_VALID_UNTIL: body.webOfferUntil ?? "", REWARDS_POINTS_PER_USD: body.rewardsPerUsd ?? "1", REWARDS_POINT_VALUE_USD: body.rewardsPointValue ?? "0.05", REWARDS_MAX_REDEEM_PERCENT: body.rewardsMaxRedeem ?? "20", REWARDS_EXPIRY_MONTHS: body.rewardsExpiryMonths ?? "12", CLINIC_HOURS: body.clinicHours ?? "", WHATSAPP_NUMBER: body.whatsapp ?? "", INSTAGRAM_URL: body.instagram ?? "", TIKTOK_URL: body.tiktok ?? "", FACEBOOK_URL: body.facebook ?? "", SHOW_SURGICAL_PRICES: String(body.surgical ?? false), CLINIC_EMAIL: body.email ?? "", BANK_TRANSFER_INSTRUCTIONS: body.instructions ?? "" };
  for (const [key, value] of Object.entries(values)) await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
