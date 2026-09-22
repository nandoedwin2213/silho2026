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
