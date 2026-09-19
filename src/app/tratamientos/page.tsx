import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { ServiceCard } from "@/components/site/service-card";
import { db } from "@/lib/db";

export const metadata = {
  title: "Tratamientos | SILHO Medicina Estética",
  description: "Explora tratamientos faciales, capilares y de rejuvenecimiento en SILHO.",
};

export default async function TreatmentsPage() {
  const categories = await db.category.findMany({ where: { active: true }, orderBy: { order: "asc" }, include: { services: { where: { active: true }, orderBy: { name: "asc" } } } });
  return <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24"><SectionHeading eyebrow="Catálogo SILHO" title="Tratamientos diseñados alrededor de ti." description="Conoce opciones para conversar durante tu valoración médica personalizada." /><div className="mt-14 space-y-16">{categories.map((category) => <section key={category.id} id={category.slug}><div className="flex items-end justify-between gap-4 border-b pb-4"><div><p className="text-xs uppercase tracking-[0.2em] text-gold">{String(category.services.length).padStart(2, "0")} tratamientos</p><h2 className="mt-2 font-heading text-3xl text-navy">{category.name}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{category.description}</p></div><Link href={`/tratamientos/${category.slug}`} className="hidden items-center gap-2 text-sm font-semibold text-navy sm:flex">Ver categoría <ArrowRight className="size-4" /></Link></div><div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{category.services.slice(0, 6).map((service) => <ServiceCard key={service.id} service={service} categorySlug={category.slug} />)}</div><Link href={`/tratamientos/${category.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-navy sm:hidden">Ver categoría <ArrowRight className="size-4" /></Link></section>)}</div></main>;
}
