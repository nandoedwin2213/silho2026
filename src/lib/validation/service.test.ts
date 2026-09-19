import { describe, expect, it } from "vitest";
import { serviceAdminSchema } from "./service";

describe("serviceAdminSchema", () => {
  it("accepts a complete service with flags and concerns", () => {
    const result = serviceAdminSchema.safeParse({ name: "Servicio de prueba", slug: "servicio-de-prueba", categoryId: "cat", description: "Descripción suficientemente larga.", shortDescription: "Descripción corta", basePrice: "120", concerns: ["acne"] });
    expect(result.success).toBe(true);
  });

  it("rejects malformed slugs", () => {
    expect(serviceAdminSchema.safeParse({ name: "Servicio", slug: "No slug", categoryId: "cat", description: "Descripción suficientemente larga.", shortDescription: "Corta", basePrice: 20 }).success).toBe(false);
  });
});
