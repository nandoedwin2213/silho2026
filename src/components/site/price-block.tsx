import { getPromptPaymentDiscount, priceBreakdown } from "@/lib/pricing";

type PriceService = {
  basePrice: unknown;
  priceFrom: boolean;
  showPrice: boolean;
  discountEligible: boolean;
  isSurgical: boolean;
};

export async function PriceBlock({ service, showSurgicalPrices = false }: { service: PriceService; showSurgicalPrices?: boolean }) {
  const hidden = !service.showPrice || (service.isSurgical && !showSurgicalPrices);
  if (hidden) return <div className="rounded-2xl bg-muted/50 p-5 text-sm text-muted-foreground">Valor determinado después de valoración médica.</div>;
  const discount = await getPromptPaymentDiscount();
  const breakdown = priceBreakdown(Number(service.basePrice), discount, service.discountEligible);
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{service.priceFrom ? "Precio desde" : "Precio"}</p>
      <p className="mt-1 text-3xl font-semibold text-navy">${breakdown.base.toFixed(2)}</p>
      {service.discountEligible && <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-sm"><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Pronto pago -{breakdown.discountPercent}%</p><p className="font-semibold text-gold">${breakdown.discounted.toFixed(2)}</p></div><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Ahorras</p><p className="font-semibold text-navy">${breakdown.savings.toFixed(2)}</p></div></div>}
    </div>
  );
}
