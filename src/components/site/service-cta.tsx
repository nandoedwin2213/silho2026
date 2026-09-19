import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ServiceCTA({ service }: { service: { slug: string; name: string; requiresMedicalAssessment: boolean; requiresManualQuote: boolean; isSurgical: boolean } }) {
  const valuation = service.requiresMedicalAssessment || service.requiresManualQuote || service.isSurgical;
  return <div className="flex flex-col gap-3 sm:flex-row"><Button asChild className="rounded-full bg-navy text-white hover:bg-navy/90"><Link href={valuation ? `/agenda?servicio=${service.slug}` : `/checkout/${service.slug}`}>{valuation ? "Solicitar valoración" : "Agenda y paga"}</Link></Button>{!valuation && <Button asChild variant="outline" className="rounded-full"><Link href={`/agenda?servicio=${service.slug}`}>Agenda valoración</Link></Button>}</div>;
}
