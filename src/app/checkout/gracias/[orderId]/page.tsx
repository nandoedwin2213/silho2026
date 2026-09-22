import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { getPatientSession } from "@/lib/patient-auth";
import { verifyPublicToken } from "@/lib/public-token";

export default async function CheckoutThanksPage({ params, searchParams }: { params: Promise<{ orderId: string }>; searchParams: Promise<{ configuracion?: string; t?: string }> }) {
  const { orderId } = await params;
  const query = await searchParams;
  const order = await db.order.findUnique({ where: { id: orderId }, include: { service: true, location: true } });
  if (!order) notFound();
  const number = await getSetting("WHATSAPP_NUMBER", "593989049001");
  const pendingConfiguration = query.configuracion === "pendiente";
  const session = await getPatientSession();
  if (!verifyPublicToken(orderId, query.t ?? "") && session?.patientId !== order.patientId) notFound();
  const paymentMethod = { PAYPHONE: "PayPhone", TRANSFER: "Transferencia bancaria", CASH: "Efectivo en clínica" }[order.paymentMethod];
  return <main className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center"><p className="text-xs uppercase tracking-[0.24em] text-gold">SILHO</p><h1 className="mt-5 font-heading text-4xl text-navy">{pendingConfiguration ? "Pago en línea en configuración" : "Solicitud recibida"}</h1><p className="mt-5 leading-7 text-muted-foreground">{pendingConfiguration ? "Te contactaremos para completar el pago." : `Registramos tu solicitud para ${order.service.name}.`}</p><div className="mt-8 w-full rounded-2xl border bg-white p-6 text-left shadow-sm"><div className="flex justify-between gap-4 border-b pb-3 text-sm"><span className="text-muted-foreground">Precio</span><span className="font-medium text-navy">${Number(order.basePrice).toFixed(2)}</span></div><div className="flex justify-between gap-4 border-b py-3 text-sm"><span className="text-muted-foreground">Descuento ({Number(order.discountPercent).toFixed(0)}%)</span><span className="font-medium text-navy">-${Number(order.discountAmount).toFixed(2)}</span></div>{order.location && <div className="flex justify-between gap-4 border-b py-3 text-sm"><span className="text-muted-foreground">Sede</span><span className="font-medium text-navy">{order.location.name} · {order.location.city}</span></div>}{order.preferredDate && <div className="flex justify-between gap-4 border-b py-3 text-sm"><span className="text-muted-foreground">Fecha preferida</span><span className="font-medium text-navy">{order.preferredDate.toLocaleDateString("es-EC")} · {order.preferredSlot}</span></div>}<div className="flex justify-between gap-4 border-b py-3 text-sm"><span className="text-muted-foreground">Método de pago</span><span className="font-medium text-navy">{paymentMethod}</span></div><div className="flex justify-between gap-4 pt-3"><span className="font-semibold text-navy">Total</span><span className="font-semibold text-navy">${Number(order.total).toFixed(2)}</span></div></div><div className="mt-8 flex flex-wrap justify-center gap-3"><Button asChild className="rounded-full bg-navy text-white hover:bg-navy/90"><Link href="/">Volver al inicio</Link></Button><WhatsAppButton number={number ?? "593989049001"} service={order.service.name} variant="inline" /></div></main>;
}
