import { webPricing, type WebPricing } from "./pricing-core";

export { discountedPrice, priceBreakdown, round2, webPricing, type WebPricing } from "./pricing-core";

export async function getWebDiscountFor(service: { slug: string; discountEligible: boolean }) {
  const { getSetting } = await import("./settings");
  const assessmentSlug = await getSetting("ASSESSMENT_SERVICE_SLUG", "valoracion-valoracion-estetica-facial");
  if (service.slug === assessmentSlug) return Number(await getSetting("WEB_ASSESSMENT_DISCOUNT", "25"));
  if (service.discountEligible) return Number(await getSetting("PRONTO_PAGO_DISCOUNT", "10"));
  return 0;
}

export async function getWebPricingFor(service: { slug: string; discountEligible: boolean; basePrice: unknown; webPrice?: unknown }): Promise<WebPricing> {
  return webPricing(Number(service.basePrice), service.webPrice == null ? null : Number(service.webPrice), await getWebDiscountFor(service), service.discountEligible);
}

export async function getPromptPaymentDiscount() {
  const { getSetting } = await import("./settings");
  return Number(await getSetting("PRONTO_PAGO_DISCOUNT", "10"));
}
