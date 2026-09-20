import { describe, expect, it } from "vitest";
import { serviceImage, serviceTopic } from "./images";

describe("service images", () => {
  it.each([
    ["Ácido hialurónico para labios", "labios"],
    ["Perfilamiento mandibular", "menton-mandibula"],
    ["Tratamiento de ojeras", "ojeras"],
    ["Rinomodelación nasal", "nariz"],
    ["Peeling químico TCA", "peeling"],
    ["Plan integral para el acné", "plan-integral"],
    ["Mesoterapia skinbooster", "skinboosters-hidratacion"],
    ["Fotoenvejecimiento y manchas", "manchas-melasma"],
  ])("maps %s to %s", (name, topic) => {
    expect(serviceTopic(name)).toBe(topic);
  });

  it("uses a safe override before the topic image", () => {
    expect(serviceImage({ name: "Tratamiento de ojeras", image: "/images/custom.jpg" }, "acne")).toBe("/images/custom.jpg");
  });

  it("falls back to the category image when no topic matches", () => {
    expect(serviceTopic("Tratamiento personalizado")).toBeNull();
    expect(serviceImage({ name: "Tratamiento personalizado" }, "acne")).toBe("/images/cat-acne.jpg");
    expect(serviceImage({ name: "Seguimiento mensual" }, "acne")).toBe("/images/cat-acne.jpg");
  });
});
