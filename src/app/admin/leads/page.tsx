import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "../_components";
import { StatusForm } from "../status-form";

export default async function LeadsPage() {
  await requireAdmin();
  const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return <><AdminHeading title="Leads" /><div className="rounded-2xl border bg-white p-5 shadow-sm"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Nombre</th><th className="p-3">Contacto</th><th className="p-3">Origen</th><th className="p-3">Estado</th><th className="p-3">Notas</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead.id} className="border-b"><td className="p-3 font-medium text-navy">{lead.name}</td><td className="p-3">{lead.phone}<br />{lead.email}</td><td className="p-3">{lead.source}</td><td className="p-3"><StatusForm model="lead" id={lead.id} value={lead.status} options={["NEW", "CONTACTED", "APPOINTMENT", "CONVERTED", "LOST"]} /></td><td className="p-3 max-w-48 truncate">{lead.notes ?? "—"}</td></tr>)}</tbody></table></div></>;
}
