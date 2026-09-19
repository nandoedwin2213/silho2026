import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeading } from "./_components";

export default async function AdminDashboard() {
  await requireAdmin();
  const now = new Date();
  const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDays = new Date(now.getTime() - 30 * 86400000);
  const [todayRevenue, monthRevenue, appointmentsToday, newPatients, sales, payments, subscriptions, activeSubscriptions, appointments, leads] = await Promise.all([
    db.order.aggregate({ _sum: { total: true }, where: { status: "PAID", createdAt: { gte: dayStart } } }),
    db.order.aggregate({ _sum: { total: true }, where: { status: "PAID", createdAt: { gte: monthStart } } }),
    db.appointment.count({ where: { date: { gte: dayStart, lt: new Date(dayStart.getTime() + 86400000) } } }),
    db.patient.count({ where: { createdAt: { gte: thirtyDays } } }),
    db.order.count({ where: { status: "PAID", createdAt: { gte: monthStart } } }),
    db.payment.count({ where: { status: "APPROVED", createdAt: { gte: monthStart } } }),
    db.subscription.count({ where: { status: "ACTIVE" } }),
    db.subscription.findMany({ where: { status: "ACTIVE" }, include: { plan: true } }),
    db.appointment.findMany({ orderBy: { date: "desc" }, take: 5, include: { patient: true, service: true } }),
    db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  const mrr = activeSubscriptions.reduce((sum, subscription) => sum + Number(subscription.plan.price), 0);
  const cards = [["Ingresos hoy", `$${Number(todayRevenue._sum.total ?? 0).toFixed(2)}`], ["Ingresos mes", `$${Number(monthRevenue._sum.total ?? 0).toFixed(2)}`], ["Citas hoy", appointmentsToday], ["Nuevos pacientes", newPatients], ["Ventas", sales], ["Pagos PayPhone", payments], ["Suscripciones activas", subscriptions], ["MRR", `$${mrr.toFixed(2)}`]];
  return <><AdminHeading title="Dashboard" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value]) => <div key={String(label)} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-semibold text-navy">{String(value)}</p></div>)}</div><div className="mt-8 grid gap-6 lg:grid-cols-2"><div className="rounded-2xl border bg-white p-6"><h2 className="font-heading text-2xl text-navy">Últimas citas</h2><div className="mt-5 space-y-3">{appointments.map((item) => <div key={item.id} className="flex justify-between border-b pb-3 text-sm"><span>{item.patient.firstName} {item.patient.lastName}<br /><span className="text-muted-foreground">{item.service.name}</span></span><span className="text-muted-foreground">{item.date.toLocaleDateString("es-EC")}</span></div>)}</div></div><div className="rounded-2xl border bg-white p-6"><h2 className="font-heading text-2xl text-navy">Últimos leads</h2><div className="mt-5 space-y-3">{leads.map((lead) => <div key={lead.id} className="flex justify-between border-b pb-3 text-sm"><span>{lead.name}<br /><span className="text-muted-foreground">{lead.phone}</span></span><span className="text-muted-foreground">{lead.status}</span></div>)}</div></div></div></>;
}
