export function checkoutTotal(base: number, discountPercent: number, eligible: boolean) {
  const discount = eligible ? discountPercent : 0;
  const discountAmount = Math.round((base * discount / 100 + Number.EPSILON) * 100) / 100;
  const total = Math.round((base - discountAmount + Number.EPSILON) * 100) / 100;
  return { base: Math.round((base + Number.EPSILON) * 100) / 100, discountPercent: discount, discountAmount, total };
}
