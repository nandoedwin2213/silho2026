import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ServiceCard } from "@/components/site/service-card";
import { db } from "@/lib/db";
import { SITE_IMAGES } from "@/lib/images";

export const metadata = {
  title: "Tratamientos | SILHO Medicina Estética",
  description: "Explora tratamientos faciales, capilares y de rejuvenecimiento en SILHO.",
};

export default async function TreatmentsPage() {
  const categories = await db.category.findMany({ where: { active: true }, orderBy: { order: "asc" }, include: { services: { where: { active: true }, orderBy: { name: "asc" } } } });
  return <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-16"><section className="relative min-h-[320px] overflow-hidden rounded-[2rem] bg-navy px-7 py-16 text-white md:px-12"><Image src={SITE_IMAGES.clinic} alt="" fill sizes="(max-width: 1280px) 100vw, 1280px" className="object-cover opacity-40" /><div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/75 to-navy/30" /><div className="relative max-w-2xl"><p className="text-xs uppercase tracking-[0.24em] text-gold-light">Catálogo SILHO</p><h1 className="mt-5 font-heading text-5xl tracking-tight md:text-6xl">Tratamientos diseñados alrededor de ti.</h1><p className="mt-6 text-lg leading-8 text-white/75">Conoce opciones para conversar durante tu valoración médica personalizada.</p></div></section><div className="mt-14 space-y-16">{categories.map((category) => <section key={category.id} id={category.slug}><div className="flex items-end justify-between gap-4 border-b pb-4"><div><p className="text-xs uppercase tracking-[0.2em] text-gold">{String(category.services.length).padStart(2, "0")} tratamientos</p><h2 className="mt-2 font-heading text-3xl text-navy">{category.name}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{category.description}</p></div><Link href={`/tratamientos/${category.slug}`} className="hidden items-center gap-2 text-sm font-semibold text-navy sm:flex">Ver categoría <ArrowRight className="size-4" /></Link></div><div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{category.services.slice(0, 6).map((service) => <ServiceCard key={service.id} service={service} categorySlug={category.slug} />)}</div><Link href={`/tratamientos/${category.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-navy sm:hidden">Ver categoría <ArrowRight className="size-4" /></Link></section>)}</div></main>;
}
