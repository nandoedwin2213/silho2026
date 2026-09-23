"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, MapPin, MessageCircle, Search, ShieldCheck, Sparkles, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { track } from "@/lib/analytics";

export type CatalogItem = { id: string; name: string; slug: string; categorySlug: string; categoryName: string; shortDescription: string; base: number; web: number; savings: number; discountPercent: number; image: string };
export type CatalogCategory = { slug: string; name: string; description: string; count: number };

const CITIES = ["Quito", "Guayaquil", "Salinas"] as const;

const money = (value: number) => `$${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2)}`;

function whatsapp(number: string, item: CatalogItem, city: string) {
  const text = `Hola, deseo recibir información y agendar el tratamiento ${item.name} con precio web de ${money(item.web)}. Mi sede preferida es ${city}.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function TreatmentCard({ item, city, whatsappNumber }: { item: CatalogItem; city: string; whatsappNumber: string }) {
  return <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[#eee6d6] bg-white shadow-[0_1px_2px_rgba(11,26,51,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(11,26,51,0.35)]">
    <div className="relative aspect-[4/3] overflow-hidden">
      <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-navy/85 via-navy/30 to-transparent" />
      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy shadow-sm"><Sparkles className="size-3 text-gold" />Precio exclusivo web</span>
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/80">{item.categoryName}</p>
        <div className="rounded-2xl bg-gold px-4 py-2 text-right text-ink shadow-lg"><p className="text-[10px] font-semibold uppercase tracking-[0.16em]">Ahorras</p><p className="font-heading text-2xl font-semibold leading-none">{money(item.savings)}</p></div>
      </div>
    </div>
    <div className="flex flex-1 flex-col p-6">
      <h3 className="font-heading text-2xl tracking-tight text-navy">{item.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{item.shortDescription}</p>
      <div className="mt-5 rounded-2xl bg-[#faf7f0] p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Precio web</p>
            <p className="mt-1 font-heading text-4xl font-semibold leading-none text-navy">{money(item.web)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Precio regular</p>
            <p className="mt-1 text-lg text-muted-foreground line-through decoration-[#b9a37a]/70">{money(item.base)}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#eee6d6] pt-3 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy px-2.5 py-1 font-semibold text-white"><Tag className="size-3 text-gold-light" />-{item.discountPercent}% agendando aquí</span>
          <span className="text-muted-foreground">Ahorro de <strong className="text-navy">{money(item.savings)}</strong></span>
        </div>
      </div>
      <div className="mt-5 grid gap-2">
        <Link href={`/agendar/${item.slug}`} onClick={() => { track("treatment_cta_click", { service: item.slug }); track("treatment_view", { service: item.slug }); }} className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#12264a]"><CalendarCheck className="size-4" />Agendar este tratamiento</Link>
        <a href={whatsapp(whatsappNumber, item, city)} target="_blank" rel="noreferrer" onClick={() => track("treatment_info_click", { service: item.slug })} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#25D366]/50 bg-white px-5 py-3 text-sm font-semibold text-[#168c43] transition hover:bg-[#f0faf3]"><MessageCircle className="size-4" />Solicitar información</a>
      </div>
      <Link href={`/tratamientos/${item.categorySlug}/${item.slug}`} onClick={() => track("treatment_view", { service: item.slug })} className="mt-4 inline-flex items-center gap-1 self-start text-sm font-semibold text-navy transition hover:text-gold">Ver detalles del procedimiento <ArrowRight className="size-4" /></Link>
    </div>
  </article>;
}

export function TreatmentCatalog({ items, categories, whatsappNumber }: { items: CatalogItem[]; categories: CatalogCategory[]; whatsappNumber: string }) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string>(CITIES[0]);
  const normalizedQuery = query.trim().toLowerCase();
  const visible = useMemo(() => items.filter((item) => (category === "all" || item.categorySlug === category) && `${item.name} ${item.shortDescription} ${item.categoryName}`.toLowerCase().includes(normalizedQuery)), [category, items, normalizedQuery]);
  const groups = useMemo(() => categories.map((group) => ({ ...group, items: visible.filter((item) => item.categorySlug === group.slug) })).filter((group) => group.items.length > 0), [categories, visible]);
  const totalSavings = useMemo(() => items.reduce((sum, item) => sum + item.savings, 0), [items]);
  const maxSavings = useMemo(() => items.reduce((max, item) => Math.max(max, item.savings), 0), [items]);

  const selectCategory = (slug: string) => { setCategory(slug); track("catalog_filter", { category: slug }); };

  return <div>
    <div className="grid gap-3 sm:grid-cols-3">
      {[{ icon: Tag, label: "Ahorro acumulado", value: money(totalSavings), hint: "frente a precios regulares" }, { icon: Sparkles, label: "Mayor ahorro", value: `hasta ${money(maxSavings)}`, hint: "en un solo tratamiento" }, { icon: ShieldCheck, label: "Valoración médica", value: "Requisito previo", hint: "todo procedimiento inicia con evaluación" }].map((stat) => <div key={stat.label} className="flex items-center gap-4 rounded-2xl border border-[#eee6d6] bg-white px-5 py-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#faf7f0] text-gold"><stat.icon className="size-5" /></span><div><p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{stat.label}</p><p className="font-heading text-xl text-navy">{stat.value}</p><p className="text-xs text-muted-foreground">{stat.hint}</p></div></div>)}
    </div>

    <div className="sticky top-16 z-10 mt-8 -mx-2 rounded-3xl border border-[#eee6d6] bg-white/90 p-2 shadow-sm backdrop-blur md:top-20">
      <div className="flex gap-2 overflow-x-auto py-0.5 pl-1 pr-8 [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:pr-1 md:[mask-image:none]">
        {[{ slug: "all", name: "Todos", count: items.length }, ...categories].map((item) => <button key={item.slug} type="button" onClick={(event) => { selectCategory(item.slug); event.currentTarget.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }); }} aria-pressed={category === item.slug} className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${category === item.slug ? "bg-navy text-white shadow" : "text-navy/80 hover:bg-[#faf7f0]"}`}>{item.name} <span className={`ml-1 text-xs ${category === item.slug ? "text-gold-light" : "text-muted-foreground"}`}>{item.count}</span></button>)}
      </div>
      <div className="mt-2 flex flex-col gap-2 border-t border-[#eee6d6] p-2 pt-3 sm:flex-row sm:items-center">
        <label className="relative block flex-1"><Search className="absolute left-4 top-3 size-4 text-muted-foreground" /><input value={query} onChange={(event) => { setQuery(event.target.value); track("catalog_search", { query: event.target.value }); }} placeholder="Buscar por tratamiento, zona o necesidad…" className="h-11 w-full rounded-full border border-[#eee6d6] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-gold" /></label>
        <label className="relative flex items-center gap-2 rounded-full border border-[#eee6d6] bg-white px-4"><MapPin className="size-4 text-gold" /><span className="text-xs text-muted-foreground">Sede</span><select value={city} onChange={(event) => setCity(event.target.value)} className="h-11 bg-transparent text-sm font-medium text-navy outline-none">{CITIES.map((option) => <option key={option}>{option}</option>)}</select></label>
      </div>
    </div>

    <p className="mt-6 text-sm text-muted-foreground">{visible.length} {visible.length === 1 ? "tratamiento" : "tratamientos"} con precio exclusivo web{category !== "all" && <> · <button type="button" onClick={() => selectCategory("all")} className="font-semibold text-navy underline-offset-4 hover:underline">ver todas las categorías</button></>}</p>

    {groups.length === 0 ? <div className="mt-8 rounded-3xl border border-dashed border-[#e2d7bf] bg-white p-12 text-center"><p className="font-heading text-xl text-navy">No encontramos tratamientos con esos criterios.</p><p className="mt-2 text-sm text-muted-foreground">Prueba con otra palabra o escríbenos por WhatsApp y te orientamos.</p><button type="button" onClick={() => { setQuery(""); selectCategory("all"); }} className="mt-5 rounded-full border border-navy px-5 py-2 text-sm font-semibold text-navy">Ver todo el catálogo</button></div>
      : groups.map((group, index) => <section key={group.slug} id={`categoria-${group.slug}`} className={index === 0 ? "mt-8" : "mt-16"}>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div><p className="text-xs uppercase tracking-[0.24em] text-gold">{String(index + 1).padStart(2, "0")} · {group.items.length} {group.items.length === 1 ? "tratamiento" : "tratamientos"}</p><h2 className="mt-2 font-heading text-3xl tracking-tight text-navy">{group.name}</h2></div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">{group.description}</p>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{group.items.map((item) => <TreatmentCard key={item.id} item={item} city={city} whatsappNumber={whatsappNumber} />)}</div>
      </section>)}
  </div>;
}
