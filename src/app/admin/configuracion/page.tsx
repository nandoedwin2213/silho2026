import { getSettings } from "@/lib/settings";
import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "../_components";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings(["PRONTO_PAGO_DISCOUNT", "WEB_ASSESSMENT_DISCOUNT", "WEB_TREATMENT_BONUS_USD", "WEB_BONUS_DAYS", "WEB_OFFER_VALID_UNTIL", "REWARDS_POINTS_PER_USD", "REWARDS_POINT_VALUE_USD", "REWARDS_MAX_REDEEM_PERCENT", "REWARDS_EXPIRY_MONTHS", "CLINIC_HOURS", "WHATSAPP_NUMBER", "INSTAGRAM_URL", "TIKTOK_URL", "FACEBOOK_URL", "SHOW_SURGICAL_PRICES", "CLINIC_EMAIL", "BANK_TRANSFER_INSTRUCTIONS"]);
  return <><AdminHeading title="Configuración" /><SettingsForm initial={{ discount: settings.PRONTO_PAGO_DISCOUNT ?? "10", webAssessmentDiscount: settings.WEB_ASSESSMENT_DISCOUNT ?? "25", webTreatmentBonus: settings.WEB_TREATMENT_BONUS_USD ?? "50", webBonusDays: settings.WEB_BONUS_DAYS ?? "30", webOfferUntil: settings.WEB_OFFER_VALID_UNTIL ?? "2026-12-31", rewardsPerUsd: settings.REWARDS_POINTS_PER_USD ?? "1", rewardsPointValue: settings.REWARDS_POINT_VALUE_USD ?? "0.05", rewardsMaxRedeem: settings.REWARDS_MAX_REDEEM_PERCENT ?? "20", rewardsExpiryMonths: settings.REWARDS_EXPIRY_MONTHS ?? "12", clinicHours: settings.CLINIC_HOURS ?? "", whatsapp: settings.WHATSAPP_NUMBER ?? "", instagram: settings.INSTAGRAM_URL ?? "", tiktok: settings.TIKTOK_URL ?? "", facebook: settings.FACEBOOK_URL ?? "", surgical: settings.SHOW_SURGICAL_PRICES === "true", email: settings.CLINIC_EMAIL ?? "", instructions: settings.BANK_TRANSFER_INSTRUCTIONS ?? "" }} /></>;
}
