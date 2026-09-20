import Link from "next/link";
import { SectionHeading } from "@/components/site/section-heading";
import { ClinicalCaseCard } from "@/components/site/clinical-case-card";
import { db } from "@/lib/db";

export const metadata = {
  title: "Casos clínicos autorizados | SILHO",
  description: "Conozca casos clínicos faciales publicados con consentimiento expreso de nuestros pacientes.",
};

const filters = [["", "Todos"], ["rejuvenecimiento-facial", "Rejuvenecimiento"], ["acne", "Acné"], ["cicatrices-acne", "Cicatrices de acné"]];

export default async function ClinicalCasesPage({ searchParams }: { searchParams: Promise<{ ruta?: string }> }) {
  const { ruta } = await searchParams;
  const items = await db.beforeAfter.findMany({ where: { published: true, patientConsent: true, ...(ruta ? { routeSlug: ruta } : {}) }, orderBy: { createdAt: "desc" } });
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
      <SectionHeading eyebrow="Casos clínicos" title="Seguimiento con autorización expresa" description="Compartimos únicamente fotografías y datos autorizados por nuestros pacientes, con contexto y límites claros." />
      <div className="mt-8 flex flex-wrap gap-2">{filters.map(([value, label]) => <Link key={label} href={value ? `/casos-clinicos?ruta=${value}` : "/casos-clinicos"} className={`rounded-full border px-4 py-2 text-sm transition hover:border-gold ${ruta === value || (!ruta && !value) ? "border-gold bg-[#f5f1e8] text-navy" : "text-muted-foreground"}`}>{label}</Link>)}</div>
      <p className="mt-8 rounded-2xl bg-[#f5f1e8] p-5 text-sm leading-6 text-navy">Los resultados varían entre pacientes. Fotografías sin manipulación de iluminación, ángulo ni edición, publicadas con autorización expresa.</p>
      {items.length > 0 ? <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{items.map((item) => <ClinicalCaseCard key={item.id} item={item} />)}</div> : <div className="mt-10 rounded-3xl border p-10 text-center"><h2 className="font-heading text-2xl text-navy">Estamos documentando casos con autorización expresa de nuestros pacientes.</h2><p className="mt-3 text-sm text-muted-foreground">Cuando existan casos publicados para esta ruta, aparecerán aquí con su contexto clínico.</p></div>}
    </main>
  );
}
