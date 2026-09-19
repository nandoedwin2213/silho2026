import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "../_components";
import { saveProfessionalAction } from "../actions";

function lines(value: unknown) { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").join("\n") : ""; }

export default async function ProfessionalAdminPage() {
  await requireAdmin();
  const professional = await db.professional.findFirst({ where: { active: true } });
  if (!professional) return <AdminHeading title="Profesional" />;
  return <><AdminHeading title="Profesional" /><form action={saveProfessionalAction} className="grid gap-4 rounded-2xl border bg-white p-6 shadow-sm md:grid-cols-2"><input name="name" defaultValue={professional.name} placeholder="Nombre" className="h-9 rounded-lg border px-3 text-sm" /><input name="title" defaultValue={professional.title} placeholder="Título" className="h-9 rounded-lg border px-3 text-sm" /><input name="photo" defaultValue={professional.photo ?? ""} placeholder="Foto URL" className="h-9 rounded-lg border px-3 text-sm md:col-span-2" /><textarea name="bio" defaultValue={professional.bio} rows={4} placeholder="Biografía" className="rounded-lg border p-3 text-sm md:col-span-2" />{(["education", "experience", "certifications", "publications", "procedures", "socials"] as const).map((key) => <textarea key={key} name={key} defaultValue={lines(professional[key])} rows={4} placeholder={`${key} (uno por línea)`} className="rounded-lg border p-3 text-sm" />)}<button className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white md:col-span-2">Guardar profesional</button></form></>;
}
