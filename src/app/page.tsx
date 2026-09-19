import Link from "next/link";
import { ArrowRight, Check, MapPin } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConcernFinder } from "@/components/site/concern-finder";
import { MedicalDisclaimer } from "@/components/site/disclaimers";
import { SectionHeading } from "@/components/site/section-heading";
import { ServiceCard } from "@/components/site/service-card";
import { db } from "@/lib/db";
import { getPromptPaymentDiscount } from "@/lib/pricing";

const faqs = [
  ["¿Cómo comienza un tratamiento?", "Cada plan comienza con una valoración médica para escuchar tus objetivos y definir opciones adecuadas para ti."],
  ["¿Puedo saber el precio antes de mi cita?", "El catálogo muestra precios comerciales orientativos cuando corresponde. Algunos procedimientos requieren valoración y cotización manual."],
  ["¿El descuento de pronto pago aplica a todo?", "No. El porcentaje se aplica únicamente a procedimientos elegibles y puede excluir cirugías, paquetes, medicamentos o tratamientos especiales."],
  ["¿Atienden en varias ciudades?", "SILHO cuenta con sedes configurables en Quito, Guayaquil y Salinas. Las direcciones se confirmarán con el equipo."],
  ["¿Los resultados están garantizados?", "No. Los resultados varían entre pacientes y dependen de la valoración, indicación y evolución individual."],
];

export default async function Home() {
  const [categories, featured, concerns, professional, locations, posts, discount] = await Promise.all([
    db.category.findMany({ where: { active: true }, orderBy: { order: "asc" }, include: { services: { where: { active: true }, take: 3 } } }),
    db.service.findMany({ where: { active: true }, orderBy: [{ featured: "desc" }, { createdAt: "asc" }], take: 6, include: { category: true } }),
    db.concern.findMany({ orderBy: { order: "asc" }, include: { services: { include: { service: { select: { name: true, slug: true, category: { select: { slug: true } } } } } } } }),
    db.professional.findFirst({ where: { active: true }, orderBy: { name: "asc" } }),
    db.location.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    db.blogPost.findMany({ where: { published: true }, orderBy: { publishedAt: "desc" }, take: 3 }),
    getPromptPaymentDiscount(),
  ]);
  const finderServices = Array.from(new Map(concerns.flatMap((concern) => concern.services.map(({ service }) => service)).map((service) => [service.slug, service])).values()).map((service) => ({
    name: service.name,
    slug: service.slug,
    categorySlug: service.category.slug,
    concernSlugs: concerns.filter((concern) => concern.services.some(({ service: linked }) => linked.slug === service.slug)).map((concern) => concern.slug),
  }));
  const faqJson = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const clinicJson = { "@context": "https://schema.org", "@type": "MedicalClinic", name: "SILHO Medicina Estética", physician: professional ? { "@type": "Physician", name: professional.name } : undefined, address: locations.map((location) => ({ "@type": "PostalAddress", addressLocality: location.city, streetAddress: location.address, addressCountry: "EC" })) };
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicJson) }} />
    <section className="relative overflow-hidden bg-navy px-6 py-24 text-white lg:px-10 lg:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(201,164,92,0.2),transparent_36%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="max-w-3xl"><p className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-gold-light">SILHO · Medicina estética</p><h1 className="font-heading text-5xl leading-[1.05] tracking-tight md:text-7xl">Medicina estética diseñada alrededor de ti.</h1><p className="mt-7 max-w-xl text-lg leading-8 text-white/70">Tratamientos faciales, capilares y de rejuvenecimiento con valoración médica personalizada.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Button asChild className="rounded-full bg-gold px-7 text-ink hover:bg-gold-light"><Link href="/agenda">Agenda tu valoración <ArrowRight /></Link></Button><Button asChild variant="outline" className="rounded-full border-white/30 bg-transparent px-7 text-white hover:bg-white/10"><Link href="/tratamientos">Ver tratamientos</Link></Button></div><div className="mt-10 border-l border-gold pl-4"><p className="text-sm font-semibold text-gold-light">{discount}% de descuento por pronto pago</p><p className="mt-1 max-w-lg text-xs leading-5 text-white/50">El descuento se aplica únicamente a procedimientos elegibles y no necesariamente a cirugías, paquetes, medicamentos o tratamientos especiales.</p></div></div>
        <div className="hidden min-h-[430px] rounded-[2rem] border border-white/10 bg-white/[0.04] lg:block" />
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10"><SectionHeading eyebrow="Encuentra tu punto de partida" title="¿Qué quieres mejorar?" description="Explora alternativas para conversar durante tu valoración. No reemplaza la indicación médica." /><div className="mt-10"><ConcernFinder concerns={concerns} services={finderServices} /></div></section>
    <section className="bg-[#fafaf9] px-6 py-20 lg:px-10"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow="Tratamientos" title="Cuidado estético con intención" description="Opciones faciales, capilares y de rejuvenecimiento organizadas para que encuentres el camino adecuado." /><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{categories.slice(0, 8).map((category) => <Link key={category.id} href={`/tratamientos/${category.slug}`} className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><p className="text-xs uppercase tracking-[0.16em] text-gold">{String(category.services.length).padStart(2, "0")} opciones</p><h3 className="mt-3 font-heading text-xl text-navy">{category.name}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{category.description}</p><ArrowRight className="mt-5 size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-gold" /></Link>)}</div><div className="mt-8 text-center"><Button asChild variant="outline" className="rounded-full"><Link href="/tratamientos">Ver todo el catálogo</Link></Button></div></div></section>
    {featured.length > 0 && <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10"><SectionHeading eyebrow="Selección SILHO" title="Tratamientos destacados" /><div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{featured.map((service) => <ServiceCard key={service.id} service={service} categorySlug={service.category.slug} />)}</div></section>}
    {professional && <section className="bg-navy px-6 py-20 text-white lg:px-10"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"><div className="min-h-80 rounded-[2rem] border border-white/10 bg-white/[0.04]" /><div><p className="text-xs uppercase tracking-[0.24em] text-gold-light">Conoce al profesional</p><h2 className="mt-4 font-heading text-4xl">{professional.name}</h2><p className="mt-2 text-gold-light">{professional.title}</p><p className="mt-6 max-w-xl text-lg leading-8 text-white/70">{professional.bio}</p><Button asChild variant="outline" className="mt-8 rounded-full border-white/30 text-white hover:bg-white/10"><Link href="/dr-edwin-ayala">Conoce más <ArrowRight /></Link></Button></div></div></section>}
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10"><div className="rounded-[2rem] bg-[#f5f1e8] p-8 md:p-12"><p className="text-xs uppercase tracking-[0.24em] text-gold">Tu plan estético comienza con una valoración personalizada.</p><h2 className="mt-4 max-w-2xl font-heading text-4xl text-navy md:text-5xl">Agenda hoy y obtén {discount}% de descuento por pronto pago en tratamientos seleccionados.</h2><Button asChild className="mt-8 rounded-full bg-navy text-white hover:bg-navy/90"><Link href="/agenda">Quiero mi valoración <ArrowRight /></Link></Button></div></section>
    <section className="bg-[#fafaf9] px-6 py-20 lg:px-10"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow="Sedes" title="Estamos cerca de ti" /><div className="mt-10 grid gap-5 md:grid-cols-3">{locations.map((location) => <Card key={location.id} className="rounded-2xl shadow-sm"><CardContent className="p-6"><MapPin className="size-5 text-gold" /><h3 className="mt-4 font-heading text-2xl text-navy">{location.city}</h3><p className="mt-2 text-sm text-muted-foreground">{location.address}</p></CardContent></Card>)}</div></div></section>
    {posts.length > 0 && <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10"><SectionHeading eyebrow="Blog SILHO" title="Información para decidir con calma" /><div className="mt-10 grid gap-5 md:grid-cols-3">{posts.map((post) => <Link key={post.id} href={`/blog/${post.slug}`} className="rounded-2xl border p-6 transition hover:border-gold hover:shadow-sm"><p className="text-xs uppercase tracking-wider text-gold">{post.category}</p><h3 className="mt-3 font-heading text-xl text-navy">{post.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p></Link>)}</div></section>}
    <section className="mx-auto max-w-3xl px-6 pb-24 lg:px-10"><SectionHeading eyebrow="Preguntas frecuentes" title="Antes de tu valoración" align="center" /><Accordion className="mt-8">{faqs.map(([question, answer], index) => <AccordionItem key={question} value={`faq-${index}`}><AccordionTrigger className="text-left text-navy">{question}</AccordionTrigger><AccordionContent className="text-muted-foreground">{answer}</AccordionContent></AccordionItem>)}</Accordion><div className="mt-8 flex items-start gap-3 rounded-2xl bg-muted/40 p-5"><Check className="mt-0.5 size-5 shrink-0 text-gold" /><MedicalDisclaimer /></div></section>
  </main>;
}
