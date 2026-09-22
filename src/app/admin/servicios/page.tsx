import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "../_components";
import { toggleServiceAction } from "../actions";

export default async function AdminServicesPage() {
  await requireAdmin();
  const services = await db.service.findMany({ orderBy: { name: "asc" }, include: { category: true } });
  return <><AdminHeading title="Servicios" action={<Button asChild className="rounded-full bg-navy text-white"><Link href="/admin/servicios/nuevo">Nuevo servicio</Link></Button>} /><div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="mb-5 flex gap-3"><input placeholder="Buscar servicio…" className="h-9 rounded-lg border px-3 text-sm" /><select className="h-9 rounded-lg border px-3 text-sm"><option>Todas las categorías</option></select></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Servicio</th><th className="p-3">Categoría</th><th className="p-3">Precio regular / web</th><th className="p-3">Duración</th><th className="p-3">Estado</th><th className="p-3" /></tr></thead><tbody>{services.map((service) => <tr key={service.id} className="border-b"><td className="p-3 font-medium text-navy">{service.name}{service.featured && <span className="ml-2 text-xs text-gold">Featured</span>}</td><td className="p-3">{service.category.name}</td><td className="p-3">${Number(service.basePrice).toFixed(2)} / {service.webPrice == null ? "—" : `$${Number(service.webPrice).toFixed(2)}`}</td><td className="p-3">{service.durationMinutes ?? "—"} min</td><td className="p-3"><form action={toggleServiceAction}><input type="hidden" name="id" value={service.id} /><input type="hidden" name="active" value={String(service.active)} /><Switch defaultChecked={service.active} /></form></td><td className="p-3 text-right"><Link href={`/admin/servicios/${service.id}`} className="font-semibold text-navy">Editar</Link></td></tr>)}</tbody></table></div></div></>;
}
