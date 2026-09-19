import { describe, expect, it } from "vitest";
import { formatInClinicTz, zonedDateToUtc } from "./time";

describe("clinic timezone", () => {
  it("converts clinic time to UTC", () => {
    expect(zonedDateToUtc("2026-09-20", "09:00").toISOString()).toBe("2026-09-20T14:00:00.000Z");
  });

  it("formats dates in America/Guayaquil", () => {
    expect(formatInClinicTz(new Date("2026-09-20T14:00:00.000Z"), { dateStyle: "short", timeStyle: "short" })).toContain("9:00");
  });
});
