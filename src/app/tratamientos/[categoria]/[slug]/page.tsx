import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MedicalDisclaimer } from "@/components/site/disclaimers";
import { PriceBlock } from "@/components/site/price-block";
import { SectionHeading } from "@/components/site/section-heading";
import { ServiceCTA } from "@/components/site/service-cta";
import { ServiceCard } from "@/components/site/service-card";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings";

type Props = { params: Promise<{ categoria: string; slug: string }> };

async function getService(params: Props["params"]) {
  const { categoria, slug } = await params;
  return db.service.findFirst({ where: { slug, active: true, category: { slug: categoria, active: true } }, include: { category: true, concerns: { include: { concern: true } } } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getService(params);
  return { title: service ? `${service.name} | SILHO` : "Tratamiento | SILHO", description: service?.shortDescription ?? "Medicina estética personalizada en SILHO." };
}

export default async function ServiceDetailPage({ params }: Props) {
  const service = await getService(params);
  if (!service) notFound();
  const [surgicalSetting, number] = await Promise.all([getSetting("SHOW_SURGICAL_PRICES", "false"), getSetting("WHATSAPP_NUMBER", "593999999999")]);
  const related = await db.service.findMany({ where: { active: true, categoryId: service.categoryId, id: { not: service.id } }, take: 3, orderBy: { name: "asc" }, include: { category: true } });
  const json = { "@context": "https://schema.org", "@type": "Service", name: service.name, description: service.description, provider: { "@type": "MedicalClinic", name: "SILHO Medicina Estética" } };
  return <main><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} /><section className="bg-[#fafaf9] px-6 py-16 lg:px-10 lg:py-24"><div className="mx-auto max-w-7xl"><Link href={`/tratamientos/${service.category.slug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-navy"><ArrowLeft className="size-4" /> {service.category.name}</Link><div className="mt-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr]"><div><p className="text-xs uppercase tracking-[0.22em] text-gold">{service.category.name}</p><h1 className="mt-4 font-heading text-5xl tracking-tight text-navy md:text-6xl">{service.name}</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">{service.description}</p><div className="mt-8 flex flex-wrap gap-2">{service.concerns.map(({ concern }) => <span key={concern.id} className="rounded-full bg-white px-3 py-1.5 text-xs text-muted-foreground shadow-sm">{concern.name}</span>)}</div><div className="mt-10"><ServiceCTA service={service} /></div><div className="mt-5"><WhatsAppButton number={number ?? "593999999999"} service={service.name} variant="inline" /></div></div><div><PriceBlock service={service} showSurgicalPrices={surgicalSetting === "true"} /><div className="mt-5"><MedicalDisclaimer /></div></div></div></div></section>{related.length > 0 && <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10"><SectionHeading eyebrow="También puedes explorar" title="Tratamientos relacionados" /><div className="mt-10 grid gap-5 md:grid-cols-3">{related.map((item) => <ServiceCard key={item.id} service={item} categorySlug={item.category.slug} />)}</div></section>}</main>;
}
