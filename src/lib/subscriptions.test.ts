import { describe, expect, it } from "vitest";
import { addMonth, nextSubscriptionState } from "./subscriptions";

describe("subscription billing", () => {
  it("clamps calendar months at month end", () => {
    expect(addMonth(new Date("2026-01-31T12:00:00Z")).toISOString()).toBe("2026-02-28T12:00:00.000Z");
    expect(addMonth(new Date("2028-01-31T12:00:00Z")).toISOString()).toBe("2028-02-29T12:00:00.000Z");
  });

  it("transitions initial and recurring payments", () => {
    expect(nextSubscriptionState({ status: "PENDING", failedAttempts: 0 }, "INITIAL", "APPROVED").status).toBe("ACTIVE");
    expect(nextSubscriptionState({ status: "ACTIVE", failedAttempts: 0 }, "RECURRING", "APPROVED").status).toBe("ACTIVE");
    expect(nextSubscriptionState({ status: "ACTIVE", failedAttempts: 0 }, "RECURRING", "ERROR")).toMatchObject({ status: "PAST_DUE", failedAttempts: 1, nextBillingDelta: 2 });
    expect(nextSubscriptionState({ status: "PAST_DUE", failedAttempts: 2 }, "RECURRING", "REJECTED")).toMatchObject({ status: "CANCELLED", failedAttempts: 3, nextBillingDelta: null });
    expect(nextSubscriptionState({ status: "PENDING", failedAttempts: 0 }, "INITIAL", "REJECTED")).toMatchObject({ status: "CANCELLED", cancelReason: "Pago inicial no aprobado" });
  });
});
