export function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function discountedPrice(base: number, pct: number) {
  return round2(base * (1 - pct / 100));
}

export function priceBreakdown(base: number, pct: number, eligible: boolean) {
  const discountPercent = eligible ? pct : 0;
  const discounted = discountedPrice(base, discountPercent);
  return {
    base: round2(base),
    discountPercent,
    discounted,
    savings: round2(base - discounted),
  };
}

export async function getPromptPaymentDiscount() {
  const { getSetting } = await import("./settings");
  return Number(await getSetting("PRONTO_PAGO_DISCOUNT", "10"));
}
