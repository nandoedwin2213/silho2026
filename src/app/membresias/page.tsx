import { SectionHeading } from "@/components/site/section-heading";
import { LeadForm } from "@/components/site/lead-form";
import { db } from "@/lib/db";

export const metadata = { title: "Membresías | SILHO Medicina Estética", description: "Conoce los planes SILHO y solicita información." };

export default async function MembershipsPage() {
  const plans = await db.subscriptionPlan.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  return <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24"><SectionHeading eyebrow="Membresías SILHO" title="Un plan que acompaña tu proceso" description="Planes editables preparados para crecer. Las prestaciones clínicas se definirán posteriormente." /><div className="mt-12 grid gap-5 md:grid-cols-3">{plans.map((plan) => <div key={plan.id} className="rounded-2xl border bg-white p-7 shadow-sm"><p className="text-xs uppercase tracking-[0.2em] text-gold">SILHO</p><h2 className="mt-3 font-heading text-2xl text-navy">{plan.name}</h2><p className="mt-5 text-4xl font-semibold text-navy">${Number(plan.price).toFixed(2)}<span className="text-sm font-normal text-muted-foreground"> / mes</span></p>{plan.description && <p className="mt-4 text-sm leading-6 text-muted-foreground">{plan.description}</p>}</div>)}</div><div className="mx-auto mt-20 max-w-xl rounded-2xl bg-[#fafaf9] p-7"><h2 className="font-heading text-2xl text-navy">Solicitar información</h2><p className="mt-2 mb-6 text-sm text-muted-foreground">Déjanos tus datos y conversaremos contigo sobre las membresías.</p><LeadForm interestedService="Membresías SILHO" buttonLabel="Solicitar información" /></div></main>;
}
