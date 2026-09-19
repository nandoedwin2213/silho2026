import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";
import { MedicalDisclaimer } from "@/components/site/disclaimers";
import { db } from "@/lib/db";

function JsonList({ value, title }: { value: unknown; title: string }) {
  if (!Array.isArray(value) || value.length === 0) return null;
  return <div><h3 className="font-semibold text-navy">{title}</h3><ul className="mt-3 space-y-2 text-sm text-muted-foreground">{value.map((item, index) => <li key={index}>• {typeof item === "string" ? item : JSON.stringify(item)}</li>)}</ul></div>;
}

export const metadata = { title: "Dr. Edwin Ayala | SILHO Medicina Estética", description: "Conoce al profesional de SILHO Medicina Estética." };

export default async function ProfessionalPage() {
  const professional = await db.professional.findFirst({ where: { active: true } });
  if (!professional) return <main className="mx-auto max-w-3xl px-6 py-24"><SectionHeading title="Información del profesional" description="La información estará disponible próximamente." /></main>;
  return <main><section className="bg-navy px-6 py-20 text-white lg:px-10 lg:py-28"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"><div className="min-h-96 rounded-[2rem] border border-white/10 bg-white/[0.04]" /><div><p className="text-xs uppercase tracking-[0.24em] text-gold-light">Profesional SILHO</p><h1 className="mt-5 font-heading text-5xl md:text-6xl">{professional.name}</h1><p className="mt-3 text-gold-light">{professional.title}</p><p className="mt-7 max-w-xl text-lg leading-8 text-white/70">{professional.bio}</p><Button asChild className="mt-8 rounded-full bg-gold text-ink hover:bg-gold-light"><Link href="/agenda">Agenda una valoración</Link></Button></div></div></section><section className="mx-auto max-w-5xl px-6 py-20 lg:px-10"><SectionHeading eyebrow="Información administrable" title="Atención orientada a tus objetivos" description="La información profesional se presenta de forma transparente y se actualizará cuando esté disponible." /><div className="mt-12 grid gap-8 md:grid-cols-2"><JsonList value={professional.education} title="Formación" /><JsonList value={professional.experience} title="Experiencia" /><JsonList value={professional.certifications} title="Certificaciones" /><JsonList value={professional.publications} title="Publicaciones" /><JsonList value={professional.procedures} title="Procedimientos" /><JsonList value={professional.socials} title="Redes sociales" /></div><MedicalDisclaimer className="mt-12" /></section></main>;
}
