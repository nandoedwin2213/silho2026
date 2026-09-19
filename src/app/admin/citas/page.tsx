import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "../_components";
import { StatusForm } from "../status-form";
import { formatInClinicTz } from "@/lib/time";

export default async function AppointmentsPage() {
  await requireAdmin();
  const appointments = await db.appointment.findMany({ orderBy: { date: "desc" }, take: 100, include: { patient: true, service: true, location: true } });
  return <><AdminHeading title="Citas" /><div className="rounded-2xl border bg-white p-5 shadow-sm"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Fecha</th><th className="p-3">Paciente</th><th className="p-3">Servicio</th><th className="p-3">Sede</th><th className="p-3">Estado</th></tr></thead><tbody>{appointments.map((appointment) => <tr key={appointment.id} className="border-b"><td className="p-3">{formatInClinicTz(appointment.date, { dateStyle: "short", timeStyle: "short" })}</td><td className="p-3">{appointment.patient.firstName} {appointment.patient.lastName}</td><td className="p-3">{appointment.service.name}</td><td className="p-3">{appointment.location.city}</td><td className="p-3"><StatusForm model="appointment" id={appointment.id} value={appointment.status} options={["REQUESTED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]} /></td></tr>)}</tbody></table></div></>;
}
