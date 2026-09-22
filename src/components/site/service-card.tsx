import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { Service } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { serviceImage } from "@/lib/images";
import { getWebDiscountFor } from "@/lib/pricing";
import { WebPrice } from "@/components/site/web-price";

export async function ServiceCard({ service, categorySlug }: { service: Pick<Service, "name" | "slug" | "shortDescription" | "basePrice" | "priceFrom" | "showPrice" | "discountEligible" | "isSurgical" | "requiresMedicalAssessment" | "requiresManualQuote" | "image">; categorySlug: string }) {
  const categoryLabel = categorySlug.replaceAll("-", " ");
  const discount = await getWebDiscountFor(service);
  const priceHidden = !service.showPrice || service.isSurgical;
  return <Card className="group overflow-hidden rounded-2xl border-border/70 p-0 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
      <Image src={serviceImage(service, categorySlug)} alt={service.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy/80 to-transparent" />
      <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] uppercase tracking-wider text-navy">{categoryLabel}</span>
      {discount > 0 && !priceHidden && <span className="absolute right-4 top-4 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-ink">-{discount}% web</span>}
    </div>
    <CardContent className="p-6">
      <div className="flex items-start justify-between gap-4"><div><h3 className="font-heading text-xl text-navy">{service.name}</h3></div><ArrowUpRight className="size-5 text-muted-foreground transition group-hover:text-gold" /></div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{service.shortDescription}</p>
      <div className="mt-5">{priceHidden ? <p className="text-sm text-muted-foreground">Precio tras valoración</p> : <WebPrice base={Number(service.basePrice)} discountPercent={discount} priceFrom={service.priceFrom} />}</div>
      <Link href={`/tratamientos/${categorySlug}/${service.slug}`} className="mt-5 inline-flex text-sm font-semibold text-navy transition hover:text-gold">Conocer más</Link>
    </CardContent>
  </Card>;
}
