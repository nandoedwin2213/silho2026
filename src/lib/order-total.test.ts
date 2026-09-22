import { describe, expect, it } from "vitest";
import { checkoutTotal } from "./order-total";

describe("checkoutTotal", () => {
  it("applies the configured discount only when eligible", () => {
    expect(checkoutTotal(100, 10, true)).toEqual({ base: 100, discountPercent: 10, discountAmount: 10, total: 90 });
    expect(checkoutTotal(100, 10, false)).toEqual({ base: 100, discountPercent: 0, discountAmount: 0, total: 100 });
  });

  it("uses the fixed web price for transfer reservations", () => {
    expect(checkoutTotal(300, 10, true, 298, "TRANSFER")).toEqual({ base: 300, discountPercent: 1, discountAmount: 2, total: 298 });
  });
});
