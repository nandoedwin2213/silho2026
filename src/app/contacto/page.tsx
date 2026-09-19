import { SectionHeading } from "@/components/site/section-heading";
import { LeadForm } from "@/components/site/lead-form";
import Image from "next/image";
import { SITE_IMAGES } from "@/lib/images";

export const metadata = { title: "Contacto | SILHO Medicina Estética", description: "Contacta al equipo de SILHO Medicina Estética." };

export default function ContactPage() {
  return <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24"><div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-start"><div><SectionHeading eyebrow="Contacto" title="Estamos para orientarte" description="Cuéntanos qué te gustaría conversar durante tu valoración." /><div className="mt-12 max-w-xl rounded-2xl border bg-white p-7 shadow-sm"><LeadForm buttonLabel="Enviar mensaje" /></div></div><div className="relative aspect-[4/5] overflow-hidden rounded-3xl"><Image src={SITE_IMAGES.clinic} alt="Espacio de atención SILHO" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" /></div></div></main>;
}
