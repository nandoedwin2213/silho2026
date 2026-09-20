import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeading } from "../../_components";

export default async function SubscriptionAdminDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const subscription = await db.subscription.findUnique({ where: { id }, include: { patient: true, plan: true, payments: { orderBy: { createdAt: "desc" } } } });
  if (!subscription) notFound();
  return <><AdminHeading title={subscription.plan.name} action={<Link href="/admin/suscripciones" className="text-sm font-semibold text-navy">← Volver</Link>} /><div className="grid gap-5 md:grid-cols-3"><div className="rounded-2xl border bg-white p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Paciente</p><p className="mt-2 font-semibold text-navy">{subscription.patient.firstName} {subscription.patient.lastName}</p><p className="mt-1 text-sm text-muted-foreground">{subscription.patient.email}</p></div><div className="rounded-2xl border bg-white p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Estado</p><p className="mt-2 font-semibold text-navy">{subscription.status}</p></div><div className="rounded-2xl border bg-white p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Próximo cobro</p><p className="mt-2 font-semibold text-navy">{subscription.nextBillingDate?.toLocaleDateString("es-EC") ?? "—"}</p></div></div><section className="mt-8 rounded-2xl border bg-white p-5"><h2 className="font-heading text-2xl text-navy">Historial de pagos</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Tipo</th><th className="p-3">Transacción</th><th className="p-3">Monto</th><th className="p-3">Estado</th><th className="p-3">Periodo</th></tr></thead><tbody>{subscription.payments.map((payment) => <tr key={payment.id} className="border-b"><td className="p-3">{payment.kind}</td><td className="p-3 text-xs">{payment.clientTransactionId}</td><td className="p-3">${Number(payment.amount).toFixed(2)}</td><td className="p-3">{payment.status}</td><td className="p-3">{payment.periodStart.toLocaleDateString("es-EC")} — {payment.periodEnd.toLocaleDateString("es-EC")}</td></tr>)}</tbody></table></div></section></>;
}
