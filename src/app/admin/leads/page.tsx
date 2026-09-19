import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "../_components";
import { updateLeadNotesAction } from "../actions";
import { StatusForm } from "../status-form";

const sources = ["WEB", "WHATSAPP", "INSTAGRAM", "FACEBOOK", "TIKTOK", "GOOGLE", "REFERRAL"];
const statuses = ["NEW", "CONTACTED", "APPOINTMENT", "CONVERTED", "LOST"];

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ source?: string; status?: string }> }) {
  await requireAdmin();
  const filters = await searchParams;
  const source = sources.includes(filters.source ?? "") ? filters.source : undefined;
  const status = statuses.includes(filters.status ?? "") ? filters.status : undefined;
  const leads = await db.lead.findMany({ where: { source: source as never, status: status as never }, orderBy: { createdAt: "desc" }, take: 100 });
  return <><AdminHeading title="Leads" /><form method="get" className="mb-5 flex flex-wrap gap-3 rounded-2xl border bg-white p-4 shadow-sm"><select name="source" defaultValue={source ?? ""} className="h-9 rounded-lg border px-3 text-sm"><option value="">Todos los orígenes</option>{sources.map((value) => <option key={value}>{value}</option>)}</select><select name="status" defaultValue={status ?? ""} className="h-9 rounded-lg border px-3 text-sm"><option value="">Todos los estados</option>{statuses.map((value) => <option key={value}>{value}</option>)}</select><button className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white">Filtrar</button></form><div className="rounded-2xl border bg-white p-5 shadow-sm"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Nombre</th><th className="p-3">Contacto</th><th className="p-3">Origen</th><th className="p-3">Estado</th><th className="p-3">Notas</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead.id} className="border-b align-top"><td className="p-3 font-medium text-navy">{lead.name}</td><td className="p-3">{lead.phone}<br />{lead.email}</td><td className="p-3">{lead.source}</td><td className="p-3"><StatusForm model="lead" id={lead.id} value={lead.status} options={statuses} /></td><td className="p-3"><form action={updateLeadNotesAction} className="flex min-w-56 gap-2"><input type="hidden" name="id" value={lead.id} /><input name="notes" defaultValue={lead.notes ?? ""} placeholder="Añadir nota…" className="h-8 min-w-0 flex-1 rounded-lg border px-2 text-xs" /><button className="text-xs font-semibold text-navy">Guardar</button></form></td></tr>)}</tbody></table></div></>;
}
