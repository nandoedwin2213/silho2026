import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isPurchasable } from "@/lib/services";

export function ServiceCTA({ service }: { service: { slug: string; name: string; active: boolean; showPrice: boolean; requiresMedicalAssessment: boolean; requiresManualQuote: boolean; isSurgical: boolean } }) {
  const purchasable = isPurchasable(service);
  return <div className="flex flex-col gap-3 sm:flex-row"><Button asChild className="rounded-full bg-navy text-white hover:bg-navy/90"><Link href={purchasable ? `/checkout/${service.slug}` : `/agenda?servicio=${service.slug}`}>{purchasable ? "Agenda y paga" : "Solicitar valoración"}</Link></Button>{purchasable && <Button asChild variant="outline" className="rounded-full"><Link href={`/agenda?servicio=${service.slug}`}>Agenda valoración</Link></Button>}</div>;
}
