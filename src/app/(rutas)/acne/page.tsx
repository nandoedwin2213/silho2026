import type { Metadata } from "next";
import { RoutePage } from "@/components/site/route-page";

export const metadata: Metadata = {
  title: "Tratamiento médico del acné | SILHO",
  description: "Controlamos el acné activo antes de que deje nuevas cicatrices con un plan médico facial individual.",
  keywords: ["tratamiento del acné", "acné activo", "medicina estética facial", "acné Ecuador"],
};

export default function AcneRoutePage() {
  return <RoutePage slug="acne" />;
}
