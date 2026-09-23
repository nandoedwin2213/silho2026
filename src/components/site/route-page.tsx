import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MedicalDisclaimer } from "@/components/site/disclaimers";
import { SectionHeading } from "@/components/site/section-heading";
import { ServiceCard } from "@/components/site/service-card";
import { routes, type RouteSlug } from "@/lib/routes";
import { db } from "@/lib/db";
import { SITE_IMAGES } from "@/lib/images";
import { getPromptPaymentDiscount } from "@/lib/pricing";
import { WebPrice } from "@/components/site/web-price";

export async function RoutePage({ slug }: { slug: RouteSlug }) {
  const route = routes[slug];
  const [services, cases, routeDiscount] = await Promise.all([
    db.service.findMany({ where: { active: true, category: { slug: { in: route.categorySlugs }, active: true } }, orderBy: [{ featured: "desc" }, { name: "asc" }], include: { category: true } }),
    db.beforeAfter.findMany({ where: { published: true, patientConsent: true, routeSlug: slug }, orderBy: { createdAt: "desc" }, take: 3 }),
    getPromptPaymentDiscount(),
  ]);
  const serviceGroups = services.reduce<Array<{ category: (typeof services)[number]["category"]; services: (typeof services)[number][] }>>((groups, service) => {
    const group = groups.find((item) => item.category.id === service.category.id);
    if (group) group.services.push(service);
    else groups.push({ category: service.category, services: [service] });
    return groups;
  }, []).sort((a, b) => a.category.order - b.category.order);
  const faqJson = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: route.faq.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) };
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson).replace(/</g, "\\u003c") }} />
      <section className="relative overflow-hidden bg-navy px-6 py-20 text-white lg:px-10 lg:py-28">
        <Image src={route.image} alt="" fill priority sizes="100vw" className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/30" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.24em] text-gold-light">{route.eyebrow}</p>
          <h1 className="mt-5 max-w-4xl font-heading text-5xl tracking-tight md:text-7xl">{route.headline}</h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-white/80">{route.tagline}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4"><WebPrice base={route.priceFrom} discountPercent={routeDiscount} priceFrom size="lg" tone="dark" /><span className="text-sm text-white/65">{route.priceNote}</span></div>
          {routeDiscount > 0 && <span className="mt-4 inline-flex rounded-full border border-gold/40 bg-white/10 px-3 py-1.5 text-xs text-gold-light">Precio exclusivo web en cada tratamiento</span>}
          <Button asChild className="mt-8 rounded-full bg-gold text-ink hover:bg-gold-light"><Link href={`/reservar?objetivo=${route.slug}`}>Reservar valoración <ArrowRight /></Link></Button>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-3 lg:px-10">
        {[
          ["El punto de partida", route.problem],
          ["Qué ocurre si no se aborda", route.consequences],
          ["La solución SILHO", route.solution],
        ].map(([title, text]) => <div key={title} className="rounded-3xl bg-[#f5f1e8] p-7"><p className="text-xs uppercase tracking-[0.18em] text-gold">01</p><h2 className="mt-4 font-heading text-2xl text-navy">{title}</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">{text}</p></div>)}
      </section>
      <section className="bg-[#fafaf9] px-6 py-20 lg:px-10"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"><div className="relative aspect-[4/3] overflow-hidden rounded-3xl"><Image src={SITE_IMAGES.consultation} alt="Valoración médica en SILHO" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" /></div><div><SectionHeading eyebrow="Valoración facial" title="Un protocolo comienza con entender su rostro." description={route.assessment} /><p className="mt-6 text-sm leading-7 text-muted-foreground">Diseñamos un plan por sesiones cuando corresponde, explicamos las alternativas y dejamos claros los cuidados, límites y seguimiento.</p></div></div></section>
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10"><SectionHeading eyebrow="Tratamientos posibles" title="Opciones que pueden formar parte de su ruta" description="La selección final depende de la valoración médica y de la evolución de cada caso." /><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{route.treatments.map((treatment) => <div key={treatment.name} className="rounded-2xl border bg-white p-6 shadow-sm"><h3 className="font-heading text-xl text-navy">{treatment.name}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{treatment.text}</p></div>)}</div>{services.length > 0 && <div className="mt-20"><SectionHeading eyebrow="Servicios disponibles" title="Explore los tratamientos de esta ruta" description="Agrupados por categoría. La indicación final se define en la valoración médica." /><nav aria-label="Categorías de servicios" className="sticky top-20 z-10 mt-8 flex gap-2 overflow-x-auto rounded-full border border-border/70 bg-white/90 p-2 backdrop-blur">{serviceGroups.map(({ category, services: categoryServices }) => <a key={category.id} href={`#svc-${category.slug}`} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm text-navy transition hover:border-gold/50 hover:bg-[#f5f1e8]"><span>{category.name}</span><span className="rounded-full bg-[#f5f1e8] px-2 py-0.5 text-xs text-muted-foreground">{categoryServices.length}</span></a>)}</nav><div className="mt-12 space-y-16">{serviceGroups.map(({ category, services: categoryServices }) => <section key={category.id} id={`svc-${category.slug}`} className="scroll-mt-28"><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-gold">{String(categoryServices.length).padStart(2, "0")} tratamientos</p><h3 className="mt-3 font-heading text-3xl text-navy">{category.name}</h3><p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{category.description ?? "Tratamientos definidos durante la valoración médica."}</p></div><Link href={`/tratamientos/${category.slug}`} className="shrink-0 text-sm font-semibold text-navy transition hover:text-gold">Ver categoría <span aria-hidden="true">→</span></Link></div><div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{categoryServices.map((service) => <ServiceCard key={service.id} service={service} categorySlug={category.slug} />)}</div></section>)}</div></div>}</section>
      <section className="bg-[#fafaf9] px-6 py-20 lg:px-10"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow="Beneficios esperados" title="Qué puede aportar un plan individual" /><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{route.benefits.map((benefit) => <div key={benefit} className="flex gap-3 rounded-2xl border bg-white p-5"><Check className="mt-0.5 size-5 shrink-0 text-gold" /><p className="text-sm leading-6 text-muted-foreground">{benefit}</p></div>)}</div></div></section>
      {cases.length > 0 && <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10"><SectionHeading eyebrow="Casos clínicos autorizados" title="Seguimiento documentado" description="Los resultados varían entre pacientes." /><div className="mt-10 grid gap-5 md:grid-cols-3">{cases.map((item) => <div key={item.id} className="overflow-hidden rounded-2xl border bg-white"><div className="grid grid-cols-2"><div className="relative aspect-square"><Image src={item.beforeImage} alt={`Antes: ${item.title}`} fill sizes="25vw" className="object-cover" /></div><div className="relative aspect-square"><Image src={item.afterImage} alt={`Después: ${item.title}`} fill sizes="25vw" className="object-cover" /></div></div><div className="p-5"><h3 className="font-heading text-lg text-navy">{item.title}</h3><p className="mt-2 text-xs leading-5 text-muted-foreground">{item.evolution ?? "Seguimiento individual documentado."}</p></div></div>)}</div></section>}
      <section className="mx-auto max-w-3xl px-6 py-20 lg:px-10"><SectionHeading eyebrow="Preguntas frecuentes" title="Antes de reservar" align="center" /><Accordion className="mt-8">{route.faq.map(([question, answer], index) => <AccordionItem key={question} value={`faq-${index}`}><AccordionTrigger className="text-left text-navy">{question}</AccordionTrigger><AccordionContent className="text-muted-foreground">{answer}</AccordionContent></AccordionItem>)}</Accordion><MedicalDisclaimer className="mt-8 rounded-2xl bg-[#f5f1e8] p-5" /></section>
      <section className="bg-navy px-6 py-20 text-center text-white lg:px-10"><h2 className="font-heading text-4xl">{route.tagline}</h2><Button asChild className="mt-8 rounded-full bg-gold text-ink hover:bg-gold-light"><Link href={`/reservar?objetivo=${route.slug}`}>Reservar valoración <ArrowRight /></Link></Button></section>
    </main>
  );
}
