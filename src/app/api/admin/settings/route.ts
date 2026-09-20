import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const settingsSchema = z.object({
  discount: z.coerce.number().min(0).max(50),
  webAssessmentDiscount: z.coerce.number().min(0).max(50),
  webTreatmentBonus: z.coerce.number().min(0).max(500),
  webBonusDays: z.coerce.number().int().min(1).max(365),
  webOfferUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")),
  rewardsPerUsd: z.coerce.number().min(0).max(10),
  rewardsPointValue: z.coerce.number().min(0).max(1),
  rewardsMaxRedeem: z.coerce.number().min(0).max(50),
  rewardsExpiryMonths: z.coerce.number().int().min(1).max(60),
  clinicHours: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  facebook: z.string().optional(),
  surgical: z.boolean().optional(),
  email: z.string().optional(),
  instructions: z.string().optional(),
});

export async function POST(request: Request) {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Configuración inválida", issues: parsed.error.flatten() }, { status: 400 });
  const body = parsed.data;
  const values = { PRONTO_PAGO_DISCOUNT: String(body.discount), WEB_ASSESSMENT_DISCOUNT: String(body.webAssessmentDiscount), WEB_TREATMENT_BONUS_USD: String(body.webTreatmentBonus), WEB_BONUS_DAYS: String(body.webBonusDays), WEB_OFFER_VALID_UNTIL: body.webOfferUntil, REWARDS_POINTS_PER_USD: String(body.rewardsPerUsd), REWARDS_POINT_VALUE_USD: String(body.rewardsPointValue), REWARDS_MAX_REDEEM_PERCENT: String(body.rewardsMaxRedeem), REWARDS_EXPIRY_MONTHS: String(body.rewardsExpiryMonths), CLINIC_HOURS: body.clinicHours ?? "", WHATSAPP_NUMBER: body.whatsapp ?? "", INSTAGRAM_URL: body.instagram ?? "", TIKTOK_URL: body.tiktok ?? "", FACEBOOK_URL: body.facebook ?? "", SHOW_SURGICAL_PRICES: String(body.surgical ?? false), CLINIC_EMAIL: body.email ?? "", BANK_TRANSFER_INSTRUCTIONS: body.instructions ?? "" };
  for (const [key, value] of Object.entries(values)) await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
