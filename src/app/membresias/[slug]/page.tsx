import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import { MedicalDisclaimer } from "@/components/site/disclaimers";
import { SectionHeading } from "@/components/site/section-heading";
import { db } from "@/lib/db";
import { requirePatient } from "@/lib/patient-auth";
import { addMonth } from "@/lib/subscriptions";
import { getSetting } from "@/lib/settings";
import { subscribeAction } from "./actions";

const consentText = "Autorizo a SILHO a guardar mi medio de pago de forma segura a través de PayPhone y a realizar el cobro mensual recurrente de este programa hasta que lo cancele desde mi cuenta.";
const money = new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" });

export default async function MembershipDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ configuracion?: string }> }) {
  const { slug } = await params;
  const query = await searchParams;
  const plan = await db.subscriptionPlan.findUnique({ where: { slug, active: true } });
  if (!plan) notFound();
  await requirePatient(`/membresias/${slug}`);
  const termsVersion = (await getSetting("SUBSCRIPTION_TERMS_VERSION", "2026-09")) || "2026-09";
  const nextDate = addMonth(new Date());
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-24">
      <Link href="/membresias" className="text-sm font-semibold text-navy">← Volver a programas</Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image src={plan.image || "/images/route-acne.jpg"} alt={plan.name} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
          </div>
          <SectionHeading className="mt-8" eyebrow={plan.tagline || "Programa All Inclusive"} title={plan.name} description={plan.description || undefined} />
          <p className="mt-5 text-3xl font-semibold text-navy">{money.format(Number(plan.price))}<span className="text-sm font-normal text-muted-foreground"> / mes</span></p>
          <p className="mt-2 text-sm text-muted-foreground">Primer cobro hoy; próximo el {nextDate.toLocaleDateString("es-EC", { dateStyle: "long" })}.</p>
          <ul className="mt-7 space-y-3">
            {plan.features.map((feature) => <li key={feature} className="flex gap-2 text-sm leading-6 text-muted-foreground"><Check className="mt-1 size-4 shrink-0 text-gold" />{feature}</li>)}
          </ul>
          <p className="mt-6 text-xs leading-5 text-muted-foreground">All Inclusive se refiere a lo detallado en el programa; consulte límites y exclusiones.</p>
        </div>
        <div className="rounded-3xl border bg-white p-7 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Activar programa</p>
          <h2 className="mt-3 font-heading text-2xl text-navy">Pago seguro con PayPhone</h2>
          {query.configuracion === "pendiente" && <p className="mt-5 rounded-xl bg-[#f5f1e8] p-4 text-sm text-navy">pago en línea en configuración, le contactaremos</p>}
          <form action={subscribeAction} className="mt-6 space-y-5">
            <input type="hidden" name="planId" value={plan.id} />
            <input type="hidden" name="slug" value={plan.slug} />
            <input type="hidden" name="consentText" value={consentText} />
            <input type="hidden" name="termsVersion" value={termsVersion} />
            <label className="flex gap-3 text-sm leading-6 text-muted-foreground"><input type="checkbox" name="consent" required className="mt-1" />{consentText}</label>
            <label className="flex gap-3 text-sm leading-6 text-muted-foreground"><input type="checkbox" name="legal" required className="mt-1" />Acepto los <Link href="/terminos" className="font-semibold text-navy">términos</Link> y la <Link href="/privacidad" className="font-semibold text-navy">política de privacidad</Link>.</label>
            <button type="submit" className="w-full rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">Pagar y activar con PayPhone</button>
          </form>
          <div className="mt-6 flex gap-3 rounded-xl bg-[#fafaf9] p-4 text-xs leading-5 text-muted-foreground"><ShieldCheck className="size-5 shrink-0 text-gold" />PayPhone procesa y tokeniza de forma segura su medio de pago. SILHO no almacena números completos de tarjeta.</div>
          <MedicalDisclaimer className="mt-5" />
        </div>
      </div>
    </main>
  );
}
