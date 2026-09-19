import { describe, expect, it } from "vitest";
import { isPurchasable } from "./services";

const service = { active: true, isSurgical: false, requiresMedicalAssessment: false, requiresManualQuote: false, showPrice: true };

describe("isPurchasable", () => {
  it("accepts an active priced non-surgical service", () => {
    expect(isPurchasable(service)).toBe(true);
  });

  it.each(["active", "isSurgical", "requiresMedicalAssessment", "requiresManualQuote", "showPrice"] as const)("rejects services with %s blocking purchase", (key) => {
    expect(isPurchasable({ ...service, [key]: key === "active" || key === "showPrice" ? false : true })).toBe(false);
  });
});
