import { describe, expect, it } from "vitest";
import { isPlaceholderDocument, normalizePhone, placeholderDocumentId } from "./phone";

describe("normalizePhone", () => {
  it.each([
    ["spaces and dashes", "099 123-4567", "0991234567"],
    ["country prefix with plus", "+593 99 123 4567", "0991234567"],
    ["country prefix without plus", "593 99 123 4567", "0991234567"],
    ["already local", "0991234567", "0991234567"],
    ["empty", "", ""],
    ["non-digits", "abc-xyz", ""],
  ])("normalizes %s", (_label, input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });
});

describe("placeholder documents", () => {
  it("creates and recognizes phone placeholders", () => {
    expect(placeholderDocumentId("0991234567")).toBe("TEL-0991234567");
    expect(isPlaceholderDocument("TEL-0991234567")).toBe(true);
    expect(isPlaceholderDocument("EC-123456")).toBe(false);
  });
});
