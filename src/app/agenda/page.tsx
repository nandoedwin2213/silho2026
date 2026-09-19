import type { Metadata } from "next";
import { SectionHeading } from "@/components/site/section-heading";
import { AgendaForm } from "@/components/site/agenda-form";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import Image from "next/image";
import { SITE_IMAGES } from "@/lib/images";

export const metadata: Metadata = { title: "Agenda tu valoración | SILHO", description: "Solicita una valoración médica personalizada en SILHO." };

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ servicio?: string }> }) {
  const [locations, services, professionals, number] = await Promise.all([
    db.location.findMany({ where: { active: true }, orderBy: { order: "asc" }, select: { id: true, name: true, city: true } }),
    db.service.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } }),
    db.professional.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    getSetting("WHATSAPP_NUMBER", "593999999999"),
  ]);
  const query = await searchParams;
  return <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24"><div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start"><div className="hidden lg:block"><div className="relative aspect-[4/5] overflow-hidden rounded-3xl"><Image src={SITE_IMAGES.agenda} alt="Agenda tu valoración en SILHO" fill priority sizes="(max-width: 1280px) 35vw, 420px" className="object-cover" /></div></div><div><SectionHeading eyebrow="Agenda" title="Tu plan estético comienza con una valoración personalizada." description="Selecciona una sede, cuéntanos qué te interesa y encontraremos un momento para conversar." /><div className="mt-12"><AgendaForm locations={locations} services={services} professionals={professionals} number={number ?? "593999999999"} initialService={query.servicio} /></div></div></div></main>;
}
