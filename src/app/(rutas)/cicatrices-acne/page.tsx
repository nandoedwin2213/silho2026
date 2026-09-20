import type { Metadata } from "next";
import { RoutePage } from "@/components/site/route-page";

export const metadata: Metadata = {
  title: "Cicatrices de acné | SILHO",
  description: "Cada cicatriz requiere una estrategia diferente. Evaluamos profundidad, textura y contexto para diseñar un protocolo.",
  keywords: ["cicatrices de acné", "láser cicatrices acné", "subcisión", "textura facial"],
};

export default function ScarsRoutePage() {
  return <RoutePage slug="cicatrices-acne" />;
}
