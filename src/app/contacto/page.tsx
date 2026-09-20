import { SectionHeading } from "@/components/site/section-heading";
import { LeadForm } from "@/components/site/lead-form";
import Image from "next/image";
import { SITE_IMAGES } from "@/lib/images";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { WhatsAppButton } from "@/components/site/whatsapp-button";

export const metadata = { title: "Contacto | SILHO Medicina Estética", description: "Contacta al equipo de SILHO Medicina Estética." };

export default async function ContactPage() {
  const [locations, hours, number] = await Promise.all([db.location.findMany({ where: { active: true }, orderBy: { order: "asc" } }), getSetting("CLINIC_HOURS", "Lunes a sábado, 09:00–18:00"), getSetting("WHATSAPP_NUMBER", "593989049001")]);
  return <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24"><div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-start"><div><SectionHeading eyebrow="Contacto" title="Hable con SILHO" description="Cuéntenos qué objetivo facial quiere ordenar y nuestro equipo le indicará el siguiente paso." /><p className="mt-6 text-sm text-muted-foreground">Horario: {hours}</p><div className="mt-6"><WhatsAppButton number={number ?? "593989049001"} variant="inline" /></div><div className="mt-8 grid gap-3 sm:grid-cols-3">{locations.map((location) => <div key={location.id} className="rounded-2xl border p-4"><p className="font-heading text-lg text-navy">{location.city}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{location.address}</p>{location.mapsUrl && <a href={location.mapsUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-semibold text-navy">Ver mapa →</a>}</div>)}</div><div className="mt-10 max-w-xl rounded-2xl border bg-white p-7 shadow-sm"><LeadForm buttonLabel="Enviar mensaje" /></div></div><div className="relative aspect-[4/5] overflow-hidden rounded-3xl"><Image src={SITE_IMAGES.clinic} alt="Espacio de atención SILHO" fill priority sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" /></div></div></main>;
}
