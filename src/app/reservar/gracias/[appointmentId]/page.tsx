import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { db } from "@/lib/db";
import { formatInClinicTz } from "@/lib/time";
import { getSetting } from "@/lib/settings";
import { getPatientSession } from "@/lib/patient-auth";
import { verifyPublicToken } from "@/lib/public-token";

export default async function BookingThanksPage({ params, searchParams }: { params: Promise<{ appointmentId: string }>; searchParams: Promise<{ pago?: string; t?: string }> }) {
  const { appointmentId } = await params;
  const query = await searchParams;
  const appointment = await db.appointment.findUnique({ where: { id: appointmentId }, include: { service: true, location: true, patient: true, order: true } });
  if (!appointment) notFound();
  const session = await getPatientSession();
  if (!verifyPublicToken(appointmentId, query.t ?? "") && session?.patientId !== appointment.patientId) notFound();
  const number = await getSetting("WHATSAPP_NUMBER", "593989049001");
  const paymentLabel = query.pago === "aprobado" ? "Pago aprobado" : query.pago === "rechazado" ? "Pago pendiente de revisión" : appointment.order?.paymentMethod === "PAYPHONE" ? "Pago pendiente" : "Reserva pendiente de confirmación";
  return <main className="mx-auto max-w-2xl px-6 py-16 text-center lg:py-24"><p className="text-xs uppercase tracking-[0.24em] text-gold">SILHO</p><h1 className="mt-5 font-heading text-4xl text-navy">Recibimos su reserva</h1><p className="mt-5 leading-7 text-muted-foreground">Su solicitud para {appointment.service.name} quedó registrada. {paymentLabel}.</p><div className="mt-8 rounded-2xl border bg-white p-6 text-left shadow-sm"><p className="font-semibold text-navy">{appointment.location.city}</p><p className="mt-2 text-sm text-muted-foreground">{formatInClinicTz(appointment.date, { dateStyle: "full", timeStyle: "short" })}</p><p className="mt-2 text-sm text-muted-foreground">Ruta: {appointment.objective ?? "Valoración facial"}</p>{appointment.order && <div className="mt-5 border-t pt-5 text-sm"><div className="flex justify-between"><span>Estado de pago</span><span className="font-semibold text-navy">{appointment.order.status}</span></div><div className="mt-2 flex justify-between"><span>Total</span><span className="font-semibold text-navy">${Number(appointment.order.total).toFixed(2)}</span></div></div>}</div><p className="mt-6 text-sm text-muted-foreground">Le enviaremos confirmación por correo. Si reservó sin cuenta, puede crearla para acumular puntos en futuras acciones elegibles.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Button asChild className="rounded-full bg-navy text-white hover:bg-navy/90"><Link href="/cuenta/registro">Crear cuenta</Link></Button><WhatsAppButton number={number ?? "593989049001"} service={appointment.service.name} variant="inline" /><Button asChild variant="outline" className="rounded-full"><Link href="/">Volver al inicio</Link></Button></div></main>;
}
