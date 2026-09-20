import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "../_components";
import { StatusForm } from "../status-form";

export default async function SubscriptionsPage() {
  await requireAdmin();
  const subscriptions = await db.subscription.findMany({ orderBy: { createdAt: "desc" }, include: { patient: true, plan: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } } });
  return <><AdminHeading title="Suscripciones" /><div className="rounded-2xl border bg-white p-5 shadow-sm"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Programa</th><th className="p-3">Paciente</th><th className="p-3">Estado</th><th className="p-3">Próximo cobro</th><th className="p-3">Intentos fallidos</th><th className="p-3">Último pago</th><th className="p-3" /></tr></thead><tbody>{subscriptions.map((subscription) => <tr key={subscription.id} className="border-b"><td className="p-3 font-semibold text-navy">{subscription.plan.name}</td><td className="p-3">{subscription.patient.firstName} {subscription.patient.lastName}</td><td className="p-3"><StatusForm model="subscription" id={subscription.id} value={subscription.status} options={["ACTIVE", "PENDING", "PAST_DUE", "CANCELLED", "PAUSED"]} /></td><td className="p-3">{subscription.nextBillingDate?.toLocaleDateString("es-EC") ?? "—"}</td><td className="p-3">{subscription.failedAttempts}</td><td className="p-3">{subscription.payments[0] ? `${subscription.payments[0].status} · $${Number(subscription.payments[0].amount).toFixed(2)}` : "—"}</td><td className="p-3"><Link href={`/admin/suscripciones/${subscription.id}`} className="font-semibold text-navy">Ver</Link></td></tr>)}</tbody></table></div></>;
}
