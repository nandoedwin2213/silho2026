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

  it("rejects web prices above the regular price with a recoverable message", () => {
    const result = serviceAdminSchema.safeParse({ name: "Servicio", slug: "servicio", categoryId: "cat", description: "Descripción suficientemente larga.", shortDescription: "Corta", basePrice: 350, webPrice: 351 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("El precio web no puede ser mayor que el precio regular");
  });

  it("accepts relative image paths", () => {
    expect(serviceAdminSchema.safeParse({ name: "Servicio", slug: "servicio", categoryId: "cat", description: "Descripción suficientemente larga.", shortDescription: "Corta", basePrice: 350, image: "/images/svc-frente-entrecejo.jpg" }).success).toBe(true);
  });

  it("rejects javascript image URLs", () => {
    expect(serviceAdminSchema.safeParse({ name: "Servicio", slug: "servicio", categoryId: "cat", description: "Descripción suficientemente larga.", shortDescription: "Corta", basePrice: 350, image: "javascript:alert(1)" }).success).toBe(false);
  });
});
