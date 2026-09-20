import type { Metadata } from "next";
import { BookingFlow } from "@/components/site/booking-flow";
import { db } from "@/lib/db";
import { getPatientSession } from "@/lib/patient-auth";
import { getPointsSummary } from "@/lib/rewards";
import { getSettings } from "@/lib/settings";
import { getWebDiscountFor } from "@/lib/pricing";
import { routeList, type RouteSlug } from "@/lib/routes";

export const metadata: Metadata = { title: "Reservar valoración facial", description: "Reserve su valoración facial en SILHO con un flujo claro y seguro." };

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ objetivo?: string; ciudad?: string }> }) {
  const query = await searchParams;
  const session = await getPatientSession();
  const settings = await getSettings(["ASSESSMENT_SERVICE_SLUG", "WEB_TREATMENT_BONUS_USD", "WEB_BONUS_DAYS", "WEB_OFFER_VALID_UNTIL", "REWARDS_POINT_VALUE_USD"]);
  const service = await db.service.findFirst({ where: { slug: settings.ASSESSMENT_SERVICE_SLUG ?? "valoracion-valoracion-estetica-facial", active: true }, select: { id: true, slug: true, name: true, basePrice: true, discountEligible: true } });
  const [locations, patient, summary, webDiscount] = await Promise.all([
    db.location.findMany({ where: { active: true }, orderBy: { order: "asc" }, select: { id: true, name: true, city: true, address: true } }),
    session ? db.patient.findUnique({ where: { id: session.patientId }, select: { firstName: true, lastName: true, documentId: true, email: true, phone: true, city: true } }) : null,
    session ? getPointsSummary(session.patientId) : Promise.resolve({ balance: 0 }),
    service ? getWebDiscountFor(service) : Promise.resolve(25),
  ]);
  if (!service) return <main className="mx-auto max-w-2xl px-6 py-24"><h1 className="font-heading text-4xl text-navy">La reserva no está disponible</h1><p className="mt-4 text-muted-foreground">La valoración facial estará disponible próximamente.</p></main>;
  const objective = routeList.some((route) => route.slug === query.objetivo) ? query.objetivo as RouteSlug : undefined;
  return <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-20"><div className="mx-auto max-w-4xl"><p className="text-xs uppercase tracking-[0.22em] text-gold">SILHO · Reserva facial</p><h1 className="mt-4 font-heading text-5xl text-navy">Reserve su valoración facial</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Evaluamos el rostro completo, definimos prioridades y dejamos claro el siguiente paso.</p><div className="mt-10"><BookingFlow locations={locations} service={{ id: service.id, name: service.name, basePrice: Number(service.basePrice) }} webDiscount={webDiscount} bonusUsd={settings.WEB_TREATMENT_BONUS_USD ?? "50"} bonusDays={settings.WEB_BONUS_DAYS ?? "30"} offerUntil={settings.WEB_OFFER_VALID_UNTIL ?? "2026-12-31"} pointsValue={Number(settings.REWARDS_POINT_VALUE_USD ?? "0.05")} patient={patient ?? undefined} pointsBalance={summary.balance} initialObjective={objective} initialCity={query.ciudad} /></div></div></main>;
}
