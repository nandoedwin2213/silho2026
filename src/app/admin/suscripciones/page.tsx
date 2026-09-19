import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "../_components";
import { StatusForm } from "../status-form";

export default async function SubscriptionsPage() {
  await requireAdmin();
  const subscriptions = await db.subscription.findMany({ orderBy: { createdAt: "desc" }, include: { patient: true, plan: true } });
  return <><AdminHeading title="Suscripciones" /><div className="rounded-2xl border bg-white p-5 shadow-sm"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Paciente</th><th className="p-3">Plan</th><th className="p-3">Precio</th><th className="p-3">Proveedor</th><th className="p-3">Estado</th></tr></thead><tbody>{subscriptions.map((subscription) => <tr key={subscription.id} className="border-b"><td className="p-3">{subscription.patient.firstName} {subscription.patient.lastName}</td><td className="p-3">{subscription.plan.name}</td><td className="p-3">${Number(subscription.plan.price).toFixed(2)}</td><td className="p-3">{subscription.provider}</td><td className="p-3"><StatusForm model="subscription" id={subscription.id} value={subscription.status} options={["ACTIVE", "PENDING", "PAST_DUE", "CANCELLED", "PAUSED"]} /></td></tr>)}</tbody></table></div></>;
}
