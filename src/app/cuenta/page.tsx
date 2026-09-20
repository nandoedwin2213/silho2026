import Link from "next/link";
import { ArrowRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyReferralButton } from "@/components/site/copy-referral-button";
import { formatInClinicTz } from "@/lib/time";
import { getPointsSummary, TIERS } from "@/lib/rewards";
import { requirePatient } from "@/lib/patient-auth";
import { db } from "@/lib/db";
import { logoutAccountAction } from "./actions";

export default async function AccountPage() {
  const session = await requirePatient();
  const [patient, account, appointments, orders, summary, rewards] = await Promise.all([
    db.patient.findUnique({ where: { id: session.patientId }, select: { firstName: true, lastName: true } }),
    db.patientAccount.findFirst({ where: { id: session.accountId, patientId: session.patientId }, select: { referralCode: true } }),
    db.appointment.findMany({ where: { patientId: session.patientId, date: { gte: new Date() }, status: { notIn: ["CANCELLED"] } }, orderBy: { date: "asc" }, take: 5, include: { service: true, location: true } }),
    db.order.findMany({ where: { patientId: session.patientId }, orderBy: { createdAt: "desc" }, take: 5, include: { service: true } }),
    getPointsSummary(session.patientId),
    db.reward.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
  ]);
  const tier = TIERS.find((item) => item.tier === summary.tier) ?? TIERS[0];
  const currentTierIndex = TIERS.findIndex((item) => item.tier === tier.tier);
  const visibleRewards = rewards.filter(
    (reward) => TIERS.findIndex((item) => item.tier === reward.minTier) <= currentTierIndex && summary.balance >= reward.pointsCost,
  );
  const progress = summary.nextTier
    ? Math.min(100, Math.round(((summary.earned12m - tier.min) / (summary.nextTier.missing + summary.earned12m - tier.min)) * 100))
    : 100;

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gold">Área de pacientes</p>
          <h1 className="mt-3 font-heading text-5xl text-navy">Hola, {patient?.firstName ?? "paciente"}</h1>
          <p className="mt-3 text-muted-foreground">{session.email}</p>
        </div>
        <form action={logoutAccountAction}>
          <Button type="submit" variant="outline" className="rounded-full"><LogOut className="size-4" />Cerrar sesión</Button>
        </form>
      </div>
      {summary.expiringSoon.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gold/40 bg-[#f5f1e8] p-5 text-sm text-navy">
          Tiene puntos que vencen próximamente. Revise el detalle en su historial.
        </div>
      )}
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl bg-navy p-7 text-white">
          <p className="text-sm text-white/70">Saldo disponible</p>
          <p className="mt-3 font-heading text-5xl">{summary.balance}</p>
          <p className="mt-2 text-sm text-white/60">puntos</p>
        </div>
        <div className="rounded-3xl border bg-white p-7">
          <p className="text-sm text-muted-foreground">Nivel actual</p>
          <p className="mt-3 font-heading text-3xl text-navy">{tier.tier}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gold" style={{ width: `${progress}%` }} /></div>
          {summary.nextTier && <p className="mt-3 text-sm text-muted-foreground">Le faltan {summary.nextTier.missing} puntos para {summary.nextTier.tier}.</p>}
        </div>
        <div className="rounded-3xl border bg-white p-7">
          <p className="text-sm text-muted-foreground">Código de referido</p>
          <p className="mt-3 font-heading text-2xl text-navy">{account?.referralCode ?? "—"}</p>
          {account?.referralCode && <CopyReferralButton code={account.referralCode} />}
          <p className="mt-2 text-sm text-muted-foreground">Compártalo con una persona cercana.</p>
        </div>
      </div>
      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between"><h2 className="font-heading text-2xl text-navy">Próximas citas</h2><Link href="/cuenta/citas" className="text-sm font-semibold text-navy">Ver historial</Link></div>
          <div className="mt-5 space-y-3">{appointments.length ? appointments.map((appointment) => (
            <div key={appointment.id} className="rounded-2xl border bg-white p-5"><p className="font-semibold text-navy">{appointment.service.name}</p><p className="mt-2 text-sm text-muted-foreground">{formatInClinicTz(appointment.date, { dateStyle: "medium", timeStyle: "short" })} · {appointment.location.city}</p><p className="mt-2 text-xs uppercase tracking-wider text-gold">{appointment.status}</p></div>
          )) : <p className="rounded-2xl border p-5 text-sm text-muted-foreground">Aún no tiene citas registradas.</p>}</div>
        </section>
        <section>
          <div className="flex items-center justify-between"><h2 className="font-heading text-2xl text-navy">Últimas órdenes</h2><Link href="/cuenta/citas" className="text-sm font-semibold text-navy">Ver detalle</Link></div>
          <div className="mt-5 space-y-3">{orders.length ? orders.map((order) => (
            <div key={order.id} className="rounded-2xl border bg-white p-5"><div className="flex justify-between gap-4"><p className="font-semibold text-navy">{order.service.name}</p><p className="font-semibold text-navy">${Number(order.total).toFixed(2)}</p></div><p className="mt-2 text-sm text-muted-foreground">{order.status} · {formatInClinicTz(order.createdAt, { dateStyle: "medium" })}</p></div>
          )) : <p className="rounded-2xl border p-5 text-sm text-muted-foreground">Aún no tiene órdenes registradas.</p>}</div>
        </section>
      </div>
      <section className="mt-12 rounded-3xl bg-[#fafaf9] p-7">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-gold">Recompensas</p><h2 className="mt-2 font-heading text-3xl text-navy">Use sus puntos en una próxima reserva</h2></div><Link href="/reservar" className="inline-flex items-center gap-2 text-sm font-semibold text-navy">Reservar <ArrowRight className="size-4" /></Link></div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">{visibleRewards.length ? visibleRewards.map((reward) => (
          <div key={reward.id} className="rounded-2xl border bg-white p-5"><h3 className="font-semibold text-navy">{reward.name}</h3><p className="mt-2 text-sm text-muted-foreground">{reward.pointsCost} puntos · {reward.description}</p><Link href={`/reservar?canje=${reward.slug}`} className="mt-3 inline-flex text-xs font-semibold text-gold">Usar en mi próxima reserva</Link></div>
        )) : <p className="text-sm text-muted-foreground">Aún no hay recompensas disponibles para su saldo y nivel.</p>}</div>
      </section>
    </main>
  );
}
