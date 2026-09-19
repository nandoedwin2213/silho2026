import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "../../_components";
import { formatInClinicTz } from "@/lib/time";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const patient = await db.patient.findUnique({ where: { id }, include: { appointments: { include: { service: true, location: true } }, orders: { include: { service: true } } } });
  if (!patient) notFound();
  return <><AdminHeading title={`${patient.firstName} ${patient.lastName}`} /><div className="grid gap-6 lg:grid-cols-2"><div className="rounded-2xl border bg-white p-6"><h2 className="font-heading text-2xl text-navy">Datos del paciente</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">Documento: {patient.documentId}<br />Correo: {patient.email}<br />Teléfono: {patient.phone}<br />Ciudad: {patient.city ?? "—"}</p></div><div className="rounded-2xl border bg-white p-6"><h2 className="font-heading text-2xl text-navy">Historial</h2><div className="mt-4 space-y-3 text-sm">{patient.appointments.map((appointment) => <p key={appointment.id} className="border-b pb-2">Cita · {appointment.service.name} · {formatInClinicTz(appointment.date, { dateStyle: "short", timeStyle: "short" })}</p>)}{patient.orders.map((order) => <p key={order.id} className="border-b pb-2">Orden · {order.service.name} · ${Number(order.total).toFixed(2)} · {order.status}</p>)}</div></div></div></>;
}
