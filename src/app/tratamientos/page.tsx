import { TreatmentCatalog } from "@/components/site/treatment-catalog";
import { CatalogDisclaimers } from "@/components/site/catalog-disclaimers";
import { db } from "@/lib/db";
import { serviceImage } from "@/lib/images";
import { getWebPricingFor } from "@/lib/pricing";
import { getSetting } from "@/lib/settings";

export const metadata = {
  title: "Tratamientos | SILHO Medicina Estética",
  description: "Tratamientos y precios exclusivos web de SILHO.",
};

export default async function TreatmentsPage() {
  const [categories, number] = await Promise.all([db.category.findMany({ where: { active: true }, orderBy: { order: "asc" }, include: { services: { where: { active: true }, orderBy: [{ basePrice: "asc" }, { name: "asc" }] } } }), getSetting("WHATSAPP_NUMBER", "593989049001")]);
  const items = (await Promise.all(categories.flatMap((category) => category.services.map(async (service) => { const pricing = await getWebPricingFor(service); return { id: service.id, name: service.name, slug: service.slug, categorySlug: category.slug, categoryName: category.name, shortDescription: service.shortDescription, base: pricing.base, web: pricing.web, savings: pricing.savings, discountPercent: pricing.discountPercent, image: serviceImage(service, category.slug) ?? "/images/cat-valoracion.jpg" }; })))).filter(Boolean);
  const json = { "@context": "https://schema.org", "@type": "ItemList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, item: { "@type": "MedicalProcedure", name: item.name, url: `/agendar/${item.slug}`, offers: { "@type": "Offer", price: item.web, priceCurrency: "USD" } } })) };
  return <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-16"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} /><section className="rounded-[2rem] bg-[#fafaf9] px-7 py-16 md:px-12"><p className="text-xs uppercase tracking-[0.24em] text-gold">SILHO · Catálogo médico</p><h1 className="mt-5 max-w-3xl font-heading text-5xl tracking-tight text-navy md:text-6xl">Tratamientos y precios exclusivos web</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Un beneficio exclusivo para pacientes que agendan o pagan en nuestra página, con información clara para elegir su siguiente paso.</p></section><section className="mt-12"><TreatmentCatalog items={items} categories={categories.map((category) => ({ slug: category.slug, name: category.name, count: category.services.length }))} whatsappNumber={number ?? "593989049001"} /></section><div className="mt-16 rounded-2xl bg-[#f5f1e8] p-6"><CatalogDisclaimers /></div></main>;
}
