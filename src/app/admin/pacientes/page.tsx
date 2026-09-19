import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "../_components";

export default async function PatientsPage() {
  await requireAdmin();
  const patients = await db.patient.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return <><AdminHeading title="Pacientes" /><div className="rounded-2xl border bg-white p-5 shadow-sm"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Paciente</th><th className="p-3">Documento</th><th className="p-3">Contacto</th><th className="p-3" /></tr></thead><tbody>{patients.map((patient) => <tr key={patient.id} className="border-b"><td className="p-3 font-medium text-navy">{patient.firstName} {patient.lastName}</td><td className="p-3">{patient.documentId}</td><td className="p-3">{patient.email}<br />{patient.phone}</td><td className="p-3 text-right"><Link href={`/admin/pacientes/${patient.id}`} className="font-semibold text-navy">Ver detalle</Link></td></tr>)}</tbody></table></div></>;
}
