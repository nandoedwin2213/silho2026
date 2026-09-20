"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { track } from "@/lib/analytics";
import { recommendRoute, type RouteSelectorAnswers } from "@/lib/route-selector";
import { routes } from "@/lib/routes";
import { Button } from "@/components/ui/button";

const questions = [
  {
    key: "concern" as const,
    title: "¿Qué le preocupa principalmente?",
    options: ["Líneas, volumen o armonía", "Acné activo", "Marcas o cicatrices", "Manchas o textura"],
  },
  {
    key: "conditions" as const,
    title: "¿Qué identifica hoy en su piel?",
    options: ["Acné activo", "Manchas", "Cicatrices", "Signos de envejecimiento"],
    multi: true,
  },
  {
    key: "zone" as const,
    title: "¿Busca trabajar una zona específica o todo el rostro?",
    options: ["Una zona específica", "Todo el rostro", "Todavía no lo tengo claro"],
  },
  {
    key: "previous" as const,
    title: "¿Ha realizado tratamientos faciales antes?",
    options: ["Sí, quiero revisar mi plan", "No todavía", "Prefiero definirlo en valoración"],
  },
];

export function RouteSelector({ cities = [] }: { cities?: string[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<RouteSelectorAnswers>({});
  const [city, setCity] = useState("");
  const recommendation = useMemo(() => recommendRoute(answers), [answers]);
  const route = routes[recommendation.slug];
  useEffect(() => {
    if (step >= questions.length) track("route_selector_result", { route: recommendation.slug, city });
  }, [city, recommendation.slug, step]);

  function choose(value: string) {
    if (question.multi) {
      const current = answers.conditions ?? [];
      setAnswers({ ...answers, conditions: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] });
      return;
    }
    setAnswers({ ...answers, [question.key]: value });
    setStep((current) => Math.min(current + 1, questions.length));
  }

  if (step > questions.length) {
    const cityQuery = city ? `&ciudad=${encodeURIComponent(city)}` : "";
    return (
      <div className="rounded-[2rem] bg-navy p-7 text-white md:p-10">
        <p className="text-xs uppercase tracking-[0.24em] text-gold-light">Su ruta sugerida</p>
        <h3 className="mt-4 font-heading text-3xl">{route.name}</h3>
        <p className="mt-4 max-w-2xl text-white/75">{route.tagline}</p>
        {recommendation.note && <p className="mt-5 rounded-2xl border border-gold/40 bg-white/10 p-4 text-sm text-gold-light">{recommendation.note}</p>}
        <p className="mt-6 text-sm leading-6 text-white/65">Esta orientación es digital y no sustituye la valoración médica.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild className="rounded-full bg-gold text-ink hover:bg-gold-light"><Link href={`/reservar?objetivo=${recommendation.slug}${cityQuery}`}>Reservar valoración <ArrowRight /></Link></Button>
          <Button variant="outline" className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10" onClick={() => { setStep(0); setAnswers({}); }}>Empezar de nuevo</Button>
        </div>
      </div>
    );
  }

  if (step === questions.length) {
    return (
      <div className="rounded-[2rem] border bg-white p-6 shadow-sm md:p-10">
        <div className="text-xs uppercase tracking-[0.18em] text-gold">Paso 5 de 5</div>
        <h3 className="mt-5 font-heading text-3xl text-navy">¿En qué ciudad le gustaría atenderse?</h3>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => { setCity(""); setStep((current) => current + 1); }} className="rounded-2xl border p-4 text-left text-sm transition hover:-translate-y-0.5 hover:border-gold">Todavía no lo sé</button>
          {cities.map((item) => <button key={item} type="button" onClick={() => { setCity(item); setStep((current) => current + 1); }} className="rounded-2xl border p-4 text-left text-sm transition hover:-translate-y-0.5 hover:border-gold">{item}</button>)}
        </div>
        <button type="button" onClick={() => setStep((current) => current - 1)} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy"><ArrowLeft className="size-4" /> Volver</button>
      </div>
    );
  }

  const question = questions[step];
  const selected = question.multi ? answers.conditions ?? [] : [answers[question.key] as string | undefined].filter(Boolean);
  return (
    <div className="rounded-[2rem] border bg-white p-6 shadow-sm md:p-10">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-gold">
        <span>Paso {step + 1} de {questions.length + 1}</span>
        <span>{question.multi ? "Puede elegir varias" : "Elija una opción"}</span>
      </div>
      <h3 className="mt-5 max-w-2xl font-heading text-3xl text-navy">{question.title}</h3>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {question.options.map((option) => {
          const active = selected.includes(option);
          return (
            <button key={option} type="button" onClick={() => choose(option)} className={`flex min-h-16 items-center justify-between rounded-2xl border p-4 text-left text-sm font-medium transition hover:-translate-y-0.5 hover:border-gold ${active ? "border-gold bg-[#f5f1e8] text-navy" : "border-border text-muted-foreground"}`}>
              <span>{option}</span>{active && <Check className="size-5 text-gold" />}
            </button>
          );
        })}
      </div>
      {question.multi && <Button type="button" className="mt-6 rounded-full bg-navy text-white hover:bg-navy/90" onClick={() => setStep((current) => current + 1)}>Continuar <ArrowRight /></Button>}
      {step > 0 && <button type="button" onClick={() => setStep((current) => current - 1)} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy"><ArrowLeft className="size-4" /> Volver</button>}
    </div>
  );
}
