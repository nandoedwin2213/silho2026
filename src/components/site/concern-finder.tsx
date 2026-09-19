"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type FinderConcern = { id: string; name: string; slug: string };
type FinderService = { name: string; slug: string; categorySlug: string; concernSlugs: string[] };

export function ConcernFinder({ concerns, services }: { concerns: FinderConcern[]; services: FinderService[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const matches = useMemo(() => selected ? services.filter((service) => service.concernSlugs.includes(selected)) : [], [selected, services]);
  return <div>
    <div className="flex flex-wrap gap-2">{concerns.map((concern) => <button key={concern.id} onClick={() => setSelected(selected === concern.slug ? null : concern.slug)} className={`rounded-full border px-4 py-2 text-sm transition ${selected === concern.slug ? "border-navy bg-navy text-white" : "border-border text-muted-foreground hover:border-navy hover:text-navy"}`}>{concern.name}</button>)}</div>
    {selected && <div className="mt-8 rounded-2xl bg-muted/40 p-5"><p className="text-sm font-semibold text-navy">Opciones que puedes conversar durante tu valoración.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{matches.length ? matches.map((service) => <Link key={service.slug} href={`/tratamientos/${service.categorySlug}/${service.slug}`} className="rounded-xl border bg-white px-4 py-3 text-sm text-navy transition hover:border-gold">{service.name}</Link>) : <p className="text-sm text-muted-foreground">Explora estas opciones con el equipo médico durante tu valoración.</p>}</div></div>}
    {!selected && <p className="mt-5 text-sm text-muted-foreground">Selecciona una preocupación para conocer opciones que puedes conversar durante tu valoración.</p>}
  </div>;
}
