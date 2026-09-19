import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "../_components";

export default async function LocationsPage() {
  await requireAdmin();
  const locations = await db.location.findMany({ orderBy: { order: "asc" } });
  return <><AdminHeading title="Sedes" /><div className="rounded-2xl border bg-white p-5 shadow-sm">{locations.map((location) => <div key={location.id} className="border-b p-4"><p className="font-semibold text-navy">{location.name} · {location.city}</p><p className="text-sm text-muted-foreground">{location.address} · {location.phone ?? "Sin teléfono"}</p></div>)}</div></>;
}
