import { redirect, notFound } from "next/navigation";
import { SectionHeading } from "@/components/site/section-heading";
import { CheckoutForm } from "@/components/site/checkout-form";
import { PriceBlock } from "@/components/site/price-block";
import { db } from "@/lib/db";
import { getPromptPaymentDiscount } from "@/lib/pricing";
import { getSetting } from "@/lib/settings";
import { isPurchasable } from "@/lib/services";

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await db.service.findUnique({ where: { slug } });
  if (!service || !service.active) notFound();
  if (!isPurchasable(service)) redirect(`/agenda?servicio=${service.slug}`);
  const [discount, transferInstructions] = await Promise.all([getPromptPaymentDiscount(), getSetting("BANK_TRANSFER_INSTRUCTIONS", "Te contactaremos para compartir los datos de transferencia y validar tu pago.")]);
  const breakdown = { base: Number(service.basePrice), discount: service.discountEligible ? discount : 0 };
  const total = Math.round((breakdown.base * (1 - breakdown.discount / 100) + Number.EPSILON) * 100) / 100;
  return <main className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-24"><SectionHeading eyebrow="Checkout" title={`Agenda y paga: ${service.name}`} description="Tus datos se procesan de forma segura. El total se recalcula en servidor antes de crear la orden." /><div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]"><CheckoutForm serviceId={service.id} serviceName={service.name} base={breakdown.base} discount={breakdown.discount} total={total} /><div><PriceBlock service={service} /><div className="mt-5 rounded-2xl border p-5 text-sm leading-6 text-muted-foreground"><p className="font-semibold text-navy">Transferencia bancaria</p><p className="mt-2">{transferInstructions}</p></div></div></div></main>;
}
