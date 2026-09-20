"use client";

import Image from "next/image";
import { useState } from "react";

type ClinicalCase = {
  title: string;
  beforeImage: string;
  afterImage: string;
  problem: string | null;
  goal: string | null;
  techniques: string | null;
  sessions: string | null;
  evolution: string | null;
  routeSlug: string | null;
};

export function ClinicalCaseCard({ item }: { item: ClinicalCase }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <article className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <button type="button" onClick={() => setRevealed(true)} className="relative block w-full text-left">
        <div className={`grid grid-cols-2 transition ${revealed ? "" : "blur-md"}`}>
          <div className="relative aspect-square"><Image src={item.beforeImage} alt={`Antes: ${item.title}`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" /></div>
          <div className="relative aspect-square"><Image src={item.afterImage} alt={`Después: ${item.title}`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" /></div>
        </div>
        {!revealed && <span className="absolute inset-0 flex items-center justify-center bg-navy/30 text-sm font-semibold text-white">Toque para ver</span>}
      </button>
      <div className="space-y-3 p-6">
        <div><p className="text-xs uppercase tracking-[0.18em] text-gold">{item.routeSlug?.replaceAll("-", " ") ?? "Ruta facial"}</p><h2 className="mt-2 font-heading text-xl text-navy">{item.title}</h2></div>
        {item.problem && <p className="text-sm leading-6 text-muted-foreground"><strong className="text-navy">Situación:</strong> {item.problem}</p>}
        {item.goal && <p className="text-sm leading-6 text-muted-foreground"><strong className="text-navy">Objetivo:</strong> {item.goal}</p>}
        {item.techniques && <p className="text-sm leading-6 text-muted-foreground"><strong className="text-navy">Técnicas:</strong> {item.techniques}</p>}
        {item.sessions && <p className="text-sm leading-6 text-muted-foreground"><strong className="text-navy">Sesiones:</strong> {item.sessions}</p>}
        {item.evolution && <p className="text-sm leading-6 text-muted-foreground"><strong className="text-navy">Evolución:</strong> {item.evolution}</p>}
      </div>
    </article>
  );
}
