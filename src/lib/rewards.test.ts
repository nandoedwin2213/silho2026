import { describe, expect, it } from "vitest";
import { computeMaxRedeemable, pointsToUsd } from "./rewards";

describe("rewards", () => {
  it("converts points to USD", () => {
    expect(pointsToUsd(300, 0.05)).toBe(15);
  });

  it("limits redemption to balance, percentage, and 100-point increments", () => {
    expect(computeMaxRedeemable(950, 500, 20, 0.05)).toBe(900);
    expect(computeMaxRedeemable(12000, 500, 20, 0.05)).toBe(2000);
  });
});
