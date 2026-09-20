import { describe, expect, it } from "vitest";
import { allocateExpirations, computeMaxRedeemable, pointsToUsd } from "./rewards";

describe("rewards", () => {
  it("converts points to USD", () => {
    expect(pointsToUsd(300, 0.05)).toBe(15);
  });

  it("limits redemption to balance, percentage, and 100-point increments", () => {
    expect(computeMaxRedeemable(950, 500, 20, 0.05)).toBe(900);
    expect(computeMaxRedeemable(12000, 500, 20, 0.05)).toBe(2000);
  });

  it("expires an unspent grant and offsets it in the balance", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const result = allocateExpirations([{ id: "grant", points: 1000, expiresAt: new Date("2025-12-31T00:00:00Z"), expiredHandled: false }], now);
    expect(result.expired).toEqual([{ id: "grant", remainder: 1000 }]);
    expect(result.balance).toBe(0);
  });

  it("expires only the unspent remainder after redemption", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const result = allocateExpirations([
      { id: "grant", points: 1000, expiresAt: new Date("2025-12-31T00:00:00Z"), expiredHandled: false },
      { id: "redeemed", points: -300, expiresAt: null },
    ], now);
    expect(result.expired).toEqual([{ id: "grant", remainder: 700 }]);
    expect(result.balance).toBe(0);
  });

  it("leaves a grant that has not expired untouched", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const result = allocateExpirations([{ id: "grant", points: 1000, expiresAt: new Date("2026-02-01T00:00:00Z"), expiredHandled: false }], now);
    expect(result.expired).toEqual([]);
    expect(result.expiringSoon).toEqual([{ id: "grant", points: 1000, expiresAt: new Date("2026-02-01T00:00:00Z") }]);
  });
});
