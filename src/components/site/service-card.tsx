import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";

export function ServiceCard({ service, categorySlug }: { service: Pick<Service, "name" | "slug" | "shortDescription" | "basePrice" | "priceFrom" | "showPrice" | "discountEligible" | "isSurgical" | "requiresMedicalAssessment" | "requiresManualQuote">; categorySlug: string }) {
  return <Card className="group rounded-2xl border-border/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><CardContent className="p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.16em] text-gold">SILHO</p><h3 className="mt-2 font-heading text-xl text-navy">{service.name}</h3></div><ArrowUpRight className="size-5 text-muted-foreground transition group-hover:text-gold" /></div><p className="mt-3 text-sm leading-6 text-muted-foreground">{service.shortDescription}</p><Link href={`/tratamientos/${categorySlug}/${service.slug}`} className="mt-5 inline-flex text-sm font-semibold text-navy transition hover:text-gold">Conocer más</Link></CardContent></Card>;
}
