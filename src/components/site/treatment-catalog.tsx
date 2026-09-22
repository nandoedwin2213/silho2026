"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { track } from "@/lib/analytics";

type Item = { id: string; name: string; slug: string; categorySlug: string; categoryName: string; shortDescription: string; base: number; web: number; savings: number; discountPercent: number; image: string };
type Category = { slug: string; name: string; count: number };

function whatsapp(number: string, item: Item, city: string) {
  const text = `Hola, deseo recibir información y agendar el tratamiento ${item.name} con precio web de $${item.web.toFixed(2)}. Mi sede preferida es ${city}.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function TreatmentCatalog({ items, categories, whatsappNumber }: { items: Item[]; categories: Category[]; whatsappNumber: string }) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Quito");
  const visible = useMemo(() => items.filter((item) => (category === "all" || item.categorySlug === category) && `${item.name} ${item.shortDescription}`.toLowerCase().includes(query.toLowerCase())), [category, items, query]);
  return <div>
    <div className="sticky top-20 z-10 -mx-2 flex gap-2 overflow-x-auto rounded-full border border-border/70 bg-white/90 p-2 backdrop-blur">
      {[{ slug: "all", name: "Todos", count: items.length }, ...categories].map((item) => <button key={item.slug} type="button" onClick={() => { setCategory(item.slug); track("catalog_filter", { category: item.slug }); }} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${category === item.slug ? "bg-navy text-white" : "text-muted-foreground hover:bg-[#f5f1e8]"}`}>{item.name} <span className="ml-1 text-xs opacity-70">{item.count}</span></button>)}
    </div>
    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><label className="relative block max-w-xl flex-1"><Search className="absolute left-4 top-3 size-4 text-muted-foreground" /><input value={query} onChange={(event) => { setQuery(event.target.value); track("catalog_search", { query: event.target.value }); }} placeholder="Buscar por tratamiento o necesidad…" className="h-11 w-full rounded-full border pl-11 pr-4 text-sm outline-none focus:border-gold" /></label><select value={city} onChange={(event) => setCity(event.target.value)} className="h-11 rounded-full border bg-white px-4 text-sm"><option>Quito</option><option>Guayaquil</option><option>Salinas</option></select></div>
    <p className="mt-5 text-sm text-muted-foreground">{visible.length} tratamientos disponibles</p>
    {visible.length === 0 ? <div className="mt-8 rounded-2xl border bg-white p-10 text-center text-muted-foreground">No encontramos tratamientos con esos criterios.</div> : <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{visible.map((item) => <article key={item.id} className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="relative aspect-[4/3] overflow-hidden"><Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" /><span className="absolute right-4 top-4 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-ink">Precio exclusivo web</span></div><div className="p-6"><p className="text-xs uppercase tracking-[0.18em] text-gold">{item.categoryName}</p><h2 className="mt-2 font-heading text-2xl text-navy">{item.name}</h2><p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">{item.shortDescription}</p><div className="mt-5"><span className="text-sm text-muted-foreground line-through">${item.base.toFixed(2)}</span><p className="text-3xl font-semibold text-navy">${item.web.toFixed(2)}</p><p className="mt-1 text-xs text-muted-foreground">Ahorras ${item.savings.toFixed(2)} · -{item.discountPercent}%</p></div><div className="mt-5 flex flex-wrap gap-2"><Link href={`/agendar/${item.slug}`} onClick={() => { track("treatment_cta_click", { service: item.slug }); track("treatment_view", { service: item.slug }); }} className="rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white">Agendar este tratamiento</Link><a href={whatsapp(whatsappNumber, item, city)} target="_blank" rel="noreferrer" onClick={() => track("treatment_info_click", { service: item.slug })} className="rounded-full border border-[#25D366]/40 px-4 py-2.5 text-sm font-semibold text-[#168c43]">Solicitar información</a></div><Link href={`/tratamientos/${item.categorySlug}/${item.slug}`} onClick={() => track("treatment_view", { service: item.slug })} className="mt-4 inline-block text-sm font-semibold text-navy">Ver detalles →</Link></div></article>)}</div>}
  </div>;
}
