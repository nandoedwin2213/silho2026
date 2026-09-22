import { webPricing } from "./pricing-core";

export function checkoutTotal(base: number, discountPercent: number, eligible: boolean, webPrice?: number | null, paymentMethod = "TRANSFER") {
  void paymentMethod;
  const pricing = webPricing(base, webPrice, discountPercent, eligible);
  return { base: pricing.base, discountPercent: pricing.discountPercent, discountAmount: Math.round((pricing.base - pricing.web + Number.EPSILON) * 100) / 100, total: pricing.web };
}
