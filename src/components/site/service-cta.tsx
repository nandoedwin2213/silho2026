import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CatalogDisclaimers } from "./catalog-disclaimers";
import { isPurchasable } from "@/lib/services";

export function ServiceCTA({ service }: { service: { slug: string; name: string; active: boolean; showPrice: boolean; requiresMedicalAssessment: boolean; requiresManualQuote: boolean; isSurgical: boolean } }) {
  const purchasable = isPurchasable(service);
  return <div><div className="flex flex-col gap-3 sm:flex-row"><Button asChild className="rounded-full bg-navy text-white hover:bg-navy/90"><Link href={purchasable ? `/agendar/${service.slug}` : `/reservar?servicio=${service.slug}`}>{purchasable ? "Agendar este tratamiento" : "Solicitar valoración"}</Link></Button>{purchasable && <Button asChild variant="outline" className="rounded-full"><Link href={`/reservar?servicio=${service.slug}`}>Agendar valoración</Link></Button>}</div>{purchasable && <div className="mt-5"><CatalogDisclaimers /></div>}</div>;
}
