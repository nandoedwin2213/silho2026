import { SectionHeading } from "@/components/site/section-heading";
import { LeadForm } from "@/components/site/lead-form";

export const metadata = { title: "Contacto | SILHO Medicina Estética", description: "Contacta al equipo de SILHO Medicina Estética." };

export default function ContactPage() {
  return <main className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-24"><SectionHeading eyebrow="Contacto" title="Estamos para orientarte" description="Cuéntanos qué te gustaría conversar durante tu valoración." /><div className="mt-12 max-w-xl rounded-2xl border bg-white p-7 shadow-sm"><LeadForm buttonLabel="Enviar mensaje" /></div></main>;
}
