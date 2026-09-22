import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getWebPricingFor } from "@/lib/pricing";
import { getSetting } from "@/lib/settings";
import { TreatmentBookingForm } from "@/components/site/treatment-booking-form";
import { CatalogDisclaimers } from "@/components/site/catalog-disclaimers";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await db.service.findFirst({ where: { slug, active: true }, select: { name: true } });
  return { title: service ? `Agendar ${service.name}` : "Agendar tratamiento" };
}

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await db.service.findFirst({ where: { slug, active: true }, include: { category: true } });
  if (!service) notFound();
  const [pricing, locations, whatsapp] = await Promise.all([getWebPricingFor(service), db.location.findMany({ where: { active: true }, orderBy: { order: "asc" }, select: { id: true, name: true, city: true } }), getSetting("WHATSAPP_NUMBER", "593989049001")]);
  return <main className="mx-auto max-w-6xl px-6 py-12 lg:px-10 lg:py-20"><div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]"><section><p className="text-xs uppercase tracking-[0.22em] text-gold">SILHO · Agenda médica</p><h1 className="mt-4 font-heading text-5xl text-navy">Agendar {service.name}</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">{service.description}</p><div className="mt-8 rounded-2xl bg-[#f5f1e8] p-6"><p className="text-sm text-muted-foreground line-through">Precio regular ${pricing.base.toFixed(2)}</p><p className="mt-1 text-4xl font-semibold text-navy">${pricing.web.toFixed(2)}</p><p className="mt-2 text-sm text-muted-foreground">Ahorras ${pricing.savings.toFixed(2)} pagando en línea.</p></div><div className="mt-8"><CatalogDisclaimers /></div><a className="mt-6 inline-block text-sm font-semibold text-[#168c43]" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hola SILHO, quiero información sobre ${service.name}.`)}`} target="_blank" rel="noreferrer">¿Prefiere consultar por WhatsApp? →</a></section><TreatmentBookingForm service={{ id: service.id, name: service.name, base: pricing.base, web: pricing.web, savings: pricing.savings }} locations={locations} /></div></main>;
}
