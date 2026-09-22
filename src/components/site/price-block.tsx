import { getWebDiscountFor } from "@/lib/pricing";
import { WebPrice } from "@/components/site/web-price";

type PriceService = {
  slug: string;
  basePrice: unknown;
  priceFrom: boolean;
  showPrice: boolean;
  discountEligible: boolean;
  isSurgical: boolean;
};

export async function PriceBlock({ service, showSurgicalPrices = false }: { service: PriceService; showSurgicalPrices?: boolean }) {
  const hidden = !service.showPrice || (service.isSurgical && !showSurgicalPrices);
  if (hidden) return <div className="rounded-2xl bg-muted/50 p-5 text-sm text-muted-foreground">Valor determinado después de valoración médica.</div>;
  const discount = await getWebDiscountFor(service);
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Precio web · pagando en línea</p>
      <div className="mt-1"><WebPrice base={Number(service.basePrice)} discountPercent={discount} priceFrom={service.priceFrom} size="lg" /></div>
      {discount > 0 && <p className="mt-4 border-t pt-4 text-xs text-muted-foreground">Reservando y pagando en línea con PayPhone</p>}
    </div>
  );
}
