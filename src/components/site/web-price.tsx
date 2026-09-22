import { webPricing } from "@/lib/pricing-core";

type WebPriceProps = {
  base: number;
  discountPercent: number;
  webPrice?: number | null;
  priceFrom?: boolean;
  size?: "md" | "lg";
  tone?: "light" | "dark";
};

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

export function WebPrice({ base, webPrice, discountPercent, priceFrom = false, size = "md", tone = "light" }: WebPriceProps) {
  const pricing = webPricing(base, webPrice, discountPercent, discountPercent > 0);
  const prefix = priceFrom ? "Desde " : "";
  const muted = tone === "dark" ? "text-white/55" : "text-muted-foreground";
  const prominent = size === "lg" ? "text-3xl" : "text-2xl";
  if (pricing.discountPercent <= 0) return <p className={`${prominent} font-semibold ${tone === "dark" ? "text-white" : "text-navy"}`}>{prefix}{money(pricing.base)}</p>;
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-baseline gap-2.5">
        <span className={`text-sm line-through ${muted}`}>{prefix}{money(pricing.base)}</span>
        <span className={`${prominent} font-semibold ${tone === "dark" ? "text-white" : "text-navy"}`}>{prefix}{money(pricing.web)}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold text-ink">Precio exclusivo web -{pricing.discountPercent}%</span>
        <span className={`text-xs ${muted}`}>Ahorras {money(pricing.savings)} pagando en línea</span>
      </div>
    </div>
  );
}
