import Link from "next/link";
import { db } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";
import { toPaymentStatus } from "@/lib/payments/status";
import { markOrderPaid } from "@/lib/orders";

export default async function PayphoneResponsePage({ searchParams }: { searchParams: Promise<{ id?: string; clientTransactionId?: string; cancelled?: string }> }) {
  const query = await searchParams;
  let result = "No pudimos identificar la transacción.";
  if (query.cancelled) result = "El pago fue cancelado. Tu solicitud permanece pendiente.";
  else if (query.id && query.clientTransactionId) {
    const payment = await db.payment.findUnique({ where: { clientTransactionId: query.clientTransactionId } });
    const provider = getPaymentProvider("payphone");
    if (payment && provider) {
      const confirmation = await provider.confirmPayment({ providerTransactionId: query.id, clientTransactionId: query.clientTransactionId });
      const paymentStatus = toPaymentStatus(confirmation.status);
      await db.payment.update({ where: { id: payment.id }, data: { providerTransactionId: query.id, status: paymentStatus, rawResponse: JSON.parse(JSON.stringify(confirmation.raw)) } });
      if (paymentStatus === "APPROVED") {
        await markOrderPaid(payment.orderId);
        result = "Tu pago fue aprobado y tu solicitud está confirmada.";
      } else if (confirmation.status === "PENDING_CONFIGURATION") result = "Pago en línea en configuración — te contactaremos para completar el pago.";
      else result = "No pudimos aprobar el pago. Te contactaremos para ayudarte.";
    }
  }
  return <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center"><p className="text-sm uppercase tracking-[0.25em] text-gold">SILHO</p><h1 className="mt-4 font-heading text-4xl text-navy">Resultado de tu pago</h1><p className="mt-4 text-muted-foreground">{result}</p><Link href="/" className="mt-8 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">Volver al inicio</Link></main>;
}
