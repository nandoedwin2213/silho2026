import type { Metadata } from "next";
import { RoutePage } from "@/components/site/route-page";

export const metadata: Metadata = {
  title: "Rejuvenecimiento y armonización facial | SILHO",
  description: "Rejuvenecer no significa cambiar su rostro. Diseñamos tratamientos faciales que respetan su identidad.",
  keywords: ["rejuvenecimiento facial", "armonización facial", "Full Face", "medicina estética facial"],
};

export default function FacialRejuvenationRoutePage() {
  return <RoutePage slug="rejuvenecimiento-facial" />;
}
