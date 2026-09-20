export function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function discountedPrice(base: number, pct: number) {
  return round2(base * (1 - pct / 100));
}

export function priceBreakdown(base: number, pct: number, eligible: boolean, pointsDiscount = 0) {
  const discountPercent = eligible ? pct : 0;
  const savings = round2(base - discountedPrice(base, discountPercent));
  const discounted = round2(Math.max(0, base - savings - pointsDiscount));
  return {
    base: round2(base),
    discountPercent,
    discounted,
    savings,
  };
}

export async function getWebDiscountFor(service: { slug: string; discountEligible: boolean }) {
  const { getSetting } = await import("./settings");
  const assessmentSlug = await getSetting("ASSESSMENT_SERVICE_SLUG", "valoracion-valoracion-estetica-facial");
  if (service.slug === assessmentSlug) return Number(await getSetting("WEB_ASSESSMENT_DISCOUNT", "25"));
  if (service.discountEligible) return Number(await getSetting("PRONTO_PAGO_DISCOUNT", "10"));
  return 0;
}

export async function getPromptPaymentDiscount() {
  const { getSetting } = await import("./settings");
  return Number(await getSetting("PRONTO_PAGO_DISCOUNT", "10"));
}
