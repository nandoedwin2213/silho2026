import { formatInClinicTz } from "@/lib/time";
import { requirePatient } from "@/lib/patient-auth";
import { db } from "@/lib/db";

export default async function AppointmentsHistoryPage() {
  const session = await requirePatient();
  const [appointments, orders] = await Promise.all([
    db.appointment.findMany({ where: { patientId: session.patientId }, orderBy: { date: "desc" }, include: { service: true, location: true } }),
    db.order.findMany({ where: { patientId: session.patientId }, orderBy: { createdAt: "desc" }, include: { service: true } }),
  ]);
  return <main className="mx-auto max-w-5xl px-6 py-12 lg:py-20"><p className="text-xs uppercase tracking-[0.22em] text-gold">Área de pacientes</p><h1 className="mt-3 font-heading text-4xl text-navy">Citas y tratamientos</h1><section className="mt-8 space-y-3"><h2 className="font-heading text-2xl text-navy">Citas</h2>{appointments.map((item) => <div key={item.id} className="rounded-2xl border bg-white p-5"><p className="font-semibold text-navy">{item.service.name}</p><p className="mt-2 text-sm text-muted-foreground">{formatInClinicTz(item.date, { dateStyle: "full", timeStyle: "short" })} · {item.location.city}</p><p className="mt-2 text-xs uppercase tracking-wider text-gold">{item.status}</p></div>)}{appointments.length === 0 && <p className="rounded-2xl border p-5 text-sm text-muted-foreground">No hay citas registradas.</p>}</section><section className="mt-12 space-y-3"><h2 className="font-heading text-2xl text-navy">Órdenes</h2>{orders.map((item) => <div key={item.id} className="rounded-2xl border bg-white p-5"><div className="flex justify-between gap-4"><p className="font-semibold text-navy">{item.service.name}</p><p className="font-semibold text-navy">${Number(item.total).toFixed(2)}</p></div><p className="mt-2 text-sm text-muted-foreground">{item.status} · {formatInClinicTz(item.createdAt, { dateStyle: "medium" })}</p></div>)}</section></main>;
}
