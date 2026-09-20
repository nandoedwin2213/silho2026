import { describe, expect, it } from "vitest";
import { canClaimPatient } from "./patient-claim";

describe("canClaimPatient", () => {
  it("allows a matching email regardless of case", () => {
    expect(canClaimPatient({ email: "Ana@Example.com", phone: "099 123 4567" }, { email: "ana@example.com", phone: "0000000000" })).toBe(true);
  });

  it("rejects a different email even when the phone matches", () => {
    expect(canClaimPatient({ email: "ana@example.com", phone: "0991234567" }, { email: "otra@example.com", phone: "099-123-4567" })).toBe(false);
  });

  it("uses normalized digits when the existing patient has no email", () => {
    expect(canClaimPatient({ email: null, phone: "(099) 123-4567" }, { email: "ana@example.com", phone: "0991234567" })).toBe(true);
    expect(canClaimPatient({ phone: "0991234567" }, { email: "ana@example.com", phone: "0981234567" })).toBe(false);
  });
});
