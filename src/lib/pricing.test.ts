import { describe, expect, it } from "vitest";
import { discountedPrice, priceBreakdown } from "./pricing";

describe("pricing", () => {
  it("calculates and rounds a discounted price", () => {
    expect(discountedPrice(200, 10)).toBe(180);
    expect(discountedPrice(99.99, 10)).toBe(89.99);
  });

  it("excludes discounts for ineligible services", () => {
    expect(priceBreakdown(200, 10, false)).toEqual({ base: 200, discountPercent: 0, discounted: 200, savings: 0 });
  });
});
