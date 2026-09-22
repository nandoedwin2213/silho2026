export function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function discountedPrice(base: number, pct: number) {
  return round2(base * (1 - pct / 100));
}

export type WebPricing = { base: number; web: number; savings: number; discountPercent: number };

export function webPricing(base: number, webPrice: number | null | undefined, pct: number, eligible: boolean): WebPricing {
  const normalizedBase = round2(base);
  if (webPrice != null && webPrice < normalizedBase) {
    const web = round2(webPrice);
    const savings = round2(normalizedBase - web);
    return { base: normalizedBase, web, savings, discountPercent: Math.round((savings / normalizedBase) * 100) };
  }
  const discountPercent = eligible ? pct : 0;
  const web = discountedPrice(normalizedBase, discountPercent);
  return { base: normalizedBase, web, savings: round2(normalizedBase - web), discountPercent };
}

export function priceBreakdown(base: number, pct: number, eligible: boolean, pointsDiscount = 0, webPrice?: number | null) {
  const web = webPricing(base, webPrice, pct, eligible);
  const discounted = round2(Math.max(0, web.web - pointsDiscount));
  return {
    base: web.base,
    discountPercent: web.discountPercent,
    discounted,
    savings: web.savings,
  };
}
