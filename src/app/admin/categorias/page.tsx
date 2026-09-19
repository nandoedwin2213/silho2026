import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "../_components";
import { saveCategoryAction } from "../actions";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await db.category.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { services: true } } } });
  return <><AdminHeading title="Categorías" /><div className="grid gap-6 lg:grid-cols-[1fr_360px]"><div className="rounded-2xl border bg-white p-5 shadow-sm"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Categoría</th><th className="p-3">Servicios</th><th className="p-3">Estado</th></tr></thead><tbody>{categories.map((category) => <tr key={category.id} className="border-b"><td className="p-3 font-medium text-navy">{category.name}<br /><span className="text-xs text-muted-foreground">{category.slug}</span></td><td className="p-3">{category._count.services}</td><td className="p-3">{category.active ? "Activa" : "Inactiva"}</td></tr>)}</tbody></table></div><form action={saveCategoryAction} className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm"><h2 className="font-heading text-xl text-navy">Nueva categoría</h2><input name="name" required placeholder="Nombre" className="h-9 w-full rounded-lg border px-3 text-sm" /><input name="slug" required placeholder="slug" className="h-9 w-full rounded-lg border px-3 text-sm" /><textarea name="description" placeholder="Descripción" className="w-full rounded-lg border p-3 text-sm" /><input name="order" type="number" defaultValue="99" className="h-9 w-full rounded-lg border px-3 text-sm" /><input type="hidden" name="active" value="true" /><button className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white">Crear categoría</button></form></div></>;
}
