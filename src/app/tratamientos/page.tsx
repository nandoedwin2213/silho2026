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
  return <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-16"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} /><section className="relative overflow-hidden rounded-[2rem] bg-[#fafaf9] px-7 py-16 md:px-12 md:py-20">
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gold/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 size-80 rounded-full bg-[#e8dcc0]/50 blur-3xl" />
      <div className="relative grid min-w-0 gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.24em] text-gold">SILHO · Catálogo médico</p>
          <h1 className="mt-5 max-w-3xl font-heading text-4xl tracking-tight text-navy sm:text-5xl md:text-6xl">Tratamientos y precios exclusivos web</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Un beneficio exclusivo para pacientes que agendan o pagan en nuestra página: precio regular y precio web frente a frente, con el ahorro en dólares visible en cada tratamiento.</p>
        </div>
        <ul className="grid min-w-0 gap-3 text-sm text-navy">
          {["Elige tu tratamiento y compara ambos precios", "Agenda tu valoración en Quito, Guayaquil o Salinas", "Paga en línea o reserva y paga en la sede", "Confirmación por WhatsApp y correo"].map((step, index) => <li key={step} className="flex items-center gap-3 rounded-2xl border border-[#eee6d6] bg-white/80 px-4 py-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-xs text-gold-light">{index + 1}</span>{step}</li>)}
        </ul>
      </div>
    </section>
    <section className="mt-12"><TreatmentCatalog items={items} categories={categories.map((category) => ({ slug: category.slug, name: category.name, description: category.description ?? "", count: category.services.length }))} whatsappNumber={number ?? "593989049001"} /></section><div className="mt-16 rounded-2xl bg-[#f5f1e8] p-6"><CatalogDisclaimers /></div></main>;
}
