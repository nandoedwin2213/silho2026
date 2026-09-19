import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "../../_components";
import { ServiceForm } from "../../service-form";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [service, categories, concerns] = await Promise.all([db.service.findUnique({ where: { id }, include: { concerns: { include: { concern: true } } } }), db.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }), db.concern.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } })]);
  if (!service) notFound();
  return <><AdminHeading title="Editar servicio" /><ServiceForm service={service} categories={categories} concerns={concerns} selectedConcerns={service.concerns.map(({ concern }) => concern.slug)} /></>;
}
