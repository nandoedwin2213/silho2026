import { SectionHeading } from "@/components/site/section-heading";
import { RouteSelector } from "@/components/site/route-selector";
import { db } from "@/lib/db";

export const metadata = {
  title: "Descubre tu ruta facial | SILHO",
  description: "Responde cinco preguntas y recibe una orientación digital sobre la ruta facial que puede ayudarte a empezar.",
};

export default async function RouteFinderPage() {
  const locations = await db.location.findMany({ where: { active: true }, orderBy: { order: "asc" }, select: { city: true } });
  return <main className="mx-auto max-w-4xl px-6 py-16 lg:px-10 lg:py-24"><SectionHeading eyebrow="Orientador facial" title="Descubra su ruta facial" description="Cinco preguntas para ordenar su inquietud y llegar mejor preparado a una valoración médica." /><div className="mt-10"><RouteSelector cities={locations.map((location) => location.city)} /></div></main>;
}
