import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings";

export default async function CheckoutThanksPage({ params, searchParams }: { params: Promise<{ orderId: string }>; searchParams: Promise<{ configuracion?: string }> }) {
  const { orderId } = await params;
  const query = await searchParams;
  const order = await db.order.findUnique({ where: { id: orderId }, include: { service: true } });
  if (!order) notFound();
  const number = await getSetting("WHATSAPP_NUMBER", "593999999999");
  const pendingConfiguration = query.configuracion === "pendiente";
  return <main className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center"><p className="text-xs uppercase tracking-[0.24em] text-gold">SILHO</p><h1 className="mt-5 font-heading text-4xl text-navy">{pendingConfiguration ? "Pago en línea en configuración" : "Solicitud recibida"}</h1><p className="mt-5 leading-7 text-muted-foreground">{pendingConfiguration ? "Te contactaremos para completar el pago." : `Registramos tu solicitud para ${order.service.name}.`}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Button asChild className="rounded-full bg-navy text-white hover:bg-navy/90"><Link href="/">Volver al inicio</Link></Button><WhatsAppButton number={number ?? "593999999999"} service={order.service.name} variant="inline" /></div></main>;
}
