import { getSettings } from "@/lib/settings";
import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "../_components";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings(["PRONTO_PAGO_DISCOUNT", "WHATSAPP_NUMBER", "INSTAGRAM_URL", "TIKTOK_URL", "FACEBOOK_URL", "SHOW_SURGICAL_PRICES", "CLINIC_EMAIL", "BANK_TRANSFER_INSTRUCTIONS"]);
  return <><AdminHeading title="Configuración" /><SettingsForm initial={{ discount: settings.PRONTO_PAGO_DISCOUNT ?? "10", whatsapp: settings.WHATSAPP_NUMBER ?? "", instagram: settings.INSTAGRAM_URL ?? "", tiktok: settings.TIKTOK_URL ?? "", facebook: settings.FACEBOOK_URL ?? "", surgical: settings.SHOW_SURGICAL_PRICES === "true", email: settings.CLINIC_EMAIL ?? "", instructions: settings.BANK_TRANSFER_INSTRUCTIONS ?? "" }} /></>;
}
