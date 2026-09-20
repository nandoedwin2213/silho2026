import { describe, expect, it } from "vitest";
import { recommendRoute } from "./route-selector";

describe("recommendRoute", () => {
  it("prioritizes active acne when acne and scars are selected", () => {
    expect(recommendRoute({ concern: "Acné activo", conditions: ["Cicatrices"] })).toEqual({
      slug: "acne",
      note: "Primero controlamos el acné activo antes de tratar las marcas.",
    });
  });

  it("recommends the scar route when there is no active acne", () => {
    expect(recommendRoute({ concern: "Marcas o cicatrices", conditions: ["Cicatrices"] })).toEqual({ slug: "cicatrices-acne" });
  });

  it("defaults to facial rejuvenation", () => {
    expect(recommendRoute({ concern: "Líneas, volumen o armonía" })).toEqual({ slug: "rejuvenecimiento-facial" });
  });
});
