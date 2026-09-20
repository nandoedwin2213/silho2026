import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { LeadForm } from "@/components/site/lead-form";
import { MedicalDisclaimer } from "@/components/site/disclaimers";
import { SectionHeading } from "@/components/site/section-heading";
import { db } from "@/lib/db";
import { SITE_IMAGES } from "@/lib/images";

export const metadata = { title: "Programas All Inclusive | SILHO Medicina Estética", description: "Programas mensuales de tratamiento y seguimiento médico facial." };

const money = new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" });

export default async function MembershipsPage() {
  const plans = await db.subscriptionPlan.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  return <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"><div className="relative aspect-[4/3] overflow-hidden rounded-3xl"><Image src={SITE_IMAGES.membresias} alt="Programas All Inclusive SILHO" fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" /></div><SectionHeading eyebrow="Programas All Inclusive SILHO" title="Un solo pago mensual. Tratamiento, seguimiento médico y cuidado de piel incluidos." /></div>
    <div className="mt-12 grid gap-6 lg:grid-cols-2">{plans.map((plan) => <article key={plan.id} className="overflow-hidden rounded-3xl border bg-white shadow-sm"><div className="relative aspect-[16/8]"><Image src={plan.image || SITE_IMAGES.membresias} alt={plan.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div><div className="p-7"><p className="text-xs uppercase tracking-[0.2em] text-gold">{plan.tagline}</p><h2 className="mt-3 font-heading text-3xl text-navy">{plan.name}</h2><p className="mt-4 text-4xl font-semibold text-navy">{money.format(Number(plan.price))}<span className="text-sm font-normal text-muted-foreground"> / mes</span></p><p className="mt-3 text-sm font-semibold text-navy">{plan.focus}</p><ul className="mt-5 space-y-3">{plan.features.map((feature) => <li key={feature} className="flex gap-2 text-sm leading-6 text-muted-foreground"><Check className="mt-1 size-4 shrink-0 text-gold" />{feature}</li>)}</ul><div className="mt-7 flex flex-wrap items-center gap-4"><Link href={`/membresias/${plan.slug}`} className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">Suscribirme <ArrowRight className="size-4" /></Link><Link href={`/membresias/${plan.slug}`} className="text-sm font-semibold text-navy">Ver detalles</Link></div></div></article>)}</div>
    <section className="mt-20"><SectionHeading eyebrow="Cómo funciona" title="Un programa claro para acompañar su proceso" /><div className="mt-8 grid gap-5 md:grid-cols-3">{[["01", "Elige tu programa"], ["02", "Valoración médica inicial"], ["03", "Sesión y control cada mes"]].map(([number, title]) => <div key={number} className="rounded-2xl border bg-white p-6"><p className="text-sm tracking-[0.2em] text-gold">{number}</p><h3 className="mt-4 font-heading text-xl text-navy">{title}</h3></div>)}</div></section>
    <section className="mx-auto mt-20 max-w-3xl"><SectionHeading eyebrow="Preguntas frecuentes" title="Lo que debe saber" /> <div className="mt-8 divide-y rounded-2xl border bg-white px-6">{[["¿Hay permanencia mínima?", "No. Puede cancelar desde su cuenta cuando lo desee."], ["¿Cómo se realiza el cobro?", "El cobro es mensual automático con tarjeta Visa o Mastercard vía PayPhone."], ["¿Qué pasa si no asisto?", "La sesión se reprograma dentro del mismo mes."], ["¿Los productos están incluidos?", "No están incluidos, pero los programas ofrecen 10–15% de descuento en productos y tratamientos adicionales."]].map(([question, answer]) => <div key={question} className="py-5"><h3 className="font-semibold text-navy">{question}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p></div>)}</div><MedicalDisclaimer className="mt-6" /><p className="mt-3 text-xs text-muted-foreground">Las prestaciones se definen en la valoración médica y pueden ajustarse al caso.</p></section>
    <div className="mx-auto mt-20 max-w-xl rounded-2xl bg-[#fafaf9] p-7"><h2 className="font-heading text-2xl text-navy">Solicitar información</h2><p className="mt-2 mb-6 text-sm text-muted-foreground">Déjenos sus datos y nuestro equipo le orientará.</p><LeadForm interestedService="Programas All Inclusive" buttonLabel="Solicitar información" /></div>
  </main>;
}
