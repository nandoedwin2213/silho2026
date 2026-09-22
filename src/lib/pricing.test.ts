import { describe, expect, it } from "vitest";
import { discountedPrice, priceBreakdown, webPricing } from "./pricing";

describe("pricing", () => {
  it("calculates and rounds a discounted price", () => {
    expect(discountedPrice(200, 10)).toBe(180);
    expect(discountedPrice(99.99, 10)).toBe(89.99);
  });

  it("excludes discounts for ineligible services", () => {
    expect(priceBreakdown(200, 10, false)).toEqual({ base: 200, discountPercent: 0, discounted: 200, savings: 0 });
  });

  it("applies points discount after the promotional savings", () => {
    expect(priceBreakdown(200, 10, true, 15)).toEqual({ base: 200, discountPercent: 10, discounted: 165, savings: 20 });
  });

  it("does not return a negative total", () => {
    expect(priceBreakdown(100, 10, true, 200).discounted).toBe(0);
  });

  it("uses fixed web pricing and derives the displayed percentage", () => {
    expect(webPricing(300, 298, 10, true)).toEqual({ base: 300, web: 298, savings: 2, discountPercent: 1 });
    expect(webPricing(1200, 900, 10, true)).toEqual({ base: 1200, web: 900, savings: 300, discountPercent: 25 });
    expect(webPricing(50, 38, 10, true)).toEqual({ base: 50, web: 38, savings: 12, discountPercent: 24 });
    expect(webPricing(100, null, 10, true)).toEqual({ base: 100, web: 90, savings: 10, discountPercent: 10 });
  });
});
