import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "../../_components";
import { ServiceForm } from "../../service-form";

export default async function NewServicePage() {
  await requireAdmin();
  const [categories, concerns] = await Promise.all([db.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }), db.concern.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } })]);
  return <><AdminHeading title="Nuevo servicio" /><ServiceForm categories={categories} concerns={concerns} /></>;
}
