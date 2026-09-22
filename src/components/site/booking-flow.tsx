"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { priceBreakdown } from "@/lib/pricing-core";
import { routeList, type RouteSlug } from "@/lib/routes";

type Location = { id: string; name: string; city: string; address: string };
type Service = { id: string; name: string; basePrice: number; webPrice?: number };
type Patient = { firstName: string; lastName: string; documentId: string; email: string; phone: string; city: string | null };
type Props = { locations: Location[]; service: Service; webDiscount: number; bonusUsd: string; bonusDays: string; offerUntil: string; pointsValue: number; patient?: Patient; pointsBalance: number; initialObjective?: RouteSlug; initialCity?: string };

const slots = Array.from({ length: 19 }, (_, index) => `${String(9 + Math.floor(index / 2)).padStart(2, "0")}:${index % 2 ? "30" : "00"}`);

export function BookingFlow({ locations, service, webDiscount, bonusUsd, bonusDays, offerUntil, pointsValue, patient, pointsBalance, initialObjective, initialCity }: Props) {
  const [step, setStep] = useState(1);
  const [objective, setObjective] = useState<RouteSlug | "">(initialObjective ?? "");
  const [locationId, setLocationId] = useState(locations.find((item) => item.city.toLowerCase() === initialCity?.toLowerCase())?.id ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [occupied, setOccupied] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"PAYPHONE" | "TRANSFER" | "CASH">("PAYPHONE");
  const [pointsRedeemed, setPointsRedeemed] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({ firstName: patient?.firstName ?? "", lastName: patient?.lastName ?? "", documentId: patient?.documentId ?? "", email: patient?.email ?? "", phone: patient?.phone ?? "", city: patient?.city ?? initialCity ?? "", allergies: false, pregnancy: false, recentTreatments: false, medication: false, notes: "" });
  const location = locations.find((item) => item.id === locationId);
  const selectedRoute = routeList.find((route) => route.slug === objective);
  const maxPoints = Math.floor(pointsBalance / 100) * 100;
  const webBreakdown = priceBreakdown(service.basePrice, webDiscount, true, 0, service.webPrice);
  const previewTotal = Math.max(0, (paymentMethod === "PAYPHONE" ? webBreakdown.discounted : service.basePrice) - pointsRedeemed * pointsValue);

  useEffect(() => {
    if (!locationId || !date) return;
    fetch(`/api/availability?locationId=${encodeURIComponent(locationId)}&date=${date}`).then((response) => response.json()).then((data: { occupied?: string[] }) => setOccupied(data.occupied ?? [])).catch(() => setOccupied([]));
  }, [date, locationId]);

  useEffect(() => {
    const documentField = document.querySelector<HTMLInputElement>('input[placeholder="Cédula o pasaporte"]');
    if (documentField) documentField.disabled = Boolean(patient?.documentId);
  }, [patient?.documentId]);

  const update = (key: keyof typeof values, value: string | boolean) => {
    if (patient?.documentId && key === "documentId") return;
    setValues((current) => ({ ...current, [key]: value }));
  };
  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(objective);
    if (step === 2) return Boolean(locationId);
    if (step === 3) return Boolean(date && time);
    if (step === 4) return Object.values(values).slice(0, 6).every(Boolean);
    return true;
  }, [date, locationId, objective, step, time, values]);
  function next() {
    if (!canContinue) { setMessage("Complete los datos requeridos para continuar."); return; }
    setMessage("");
    setStep((current) => Math.min(7, current + 1));
    track("booking_step", { step: step + 1 });
  }
  async function submit() {
    if (!canContinue) { setMessage("Complete los datos requeridos para continuar."); return; }
    if (!acceptTerms) { setMessage("Debe aceptar los términos para continuar."); return; }
    setLoading(true);
    setMessage("");
    track("booking_submit", { paymentMethod });
    const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ objective: objective || undefined, locationId, date, time, firstName: values.firstName, lastName: values.lastName, documentId: values.documentId, email: values.email, phone: values.phone, city: values.city, intake: { allergies: values.allergies, pregnancy: values.pregnancy, recentTreatments: values.recentTreatments, medication: values.medication, notes: values.notes || undefined }, referralCode: referralCode || undefined, pointsRedeemed, paymentMethod, acceptPrivacy: acceptTerms, acceptTerms }) });
    const data = await response.json();
    if (!response.ok) setMessage(data.error ?? "No pudimos crear su reserva.");
    else if (data.redirectUrl?.startsWith("http")) { track("payment_redirect", { paymentMethod }); window.location.href = data.redirectUrl; }
    else window.location.href = data.redirectUrl;
    setLoading(false);
  }
  return (
    <div className="rounded-[2rem] border bg-white p-6 shadow-sm md:p-10">
      <div className="flex items-center gap-2">{Array.from({ length: 7 }, (_, index) => <span key={index} className={`h-1.5 flex-1 rounded-full ${index + 1 <= step ? "bg-gold" : "bg-border"}`} />)}</div>
      <div className="mt-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Paso {step} de 7</p>
        {step === 1 && <div><h2 className="mt-3 font-heading text-3xl text-navy">¿Qué desea priorizar?</h2><div className="mt-7 grid gap-3 sm:grid-cols-3">{routeList.map((route) => <button type="button" key={route.slug} onClick={() => setObjective(route.slug)} className={`rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 ${objective === route.slug ? "border-gold bg-[#f5f1e8]" : ""}`}><h3 className="font-heading text-lg text-navy">{route.name}</h3><p className="mt-2 text-sm text-muted-foreground">{route.tagline}</p></button>)}<Link href="/descubre-tu-ruta" className="rounded-2xl border p-5 text-left transition hover:-translate-y-0.5"><h3 className="font-heading text-lg text-navy">No estoy seguro</h3><p className="mt-2 text-sm text-muted-foreground">Descubra su ruta facial.</p></Link></div></div>}
        {step === 2 && <div><h2 className="mt-3 font-heading text-3xl text-navy">Elija una sede</h2><div className="mt-7 grid gap-3 sm:grid-cols-2">{locations.map((item) => <button type="button" key={item.id} onClick={() => setLocationId(item.id)} className={`rounded-2xl border p-5 text-left ${locationId === item.id ? "border-gold bg-[#f5f1e8]" : ""}`}><MapPin className="size-5 text-gold" /><h3 className="mt-3 font-semibold text-navy">{item.city}</h3><p className="mt-1 text-sm text-muted-foreground">{item.address}</p></button>)}</div></div>}
        {step === 3 && <div><h2 className="mt-3 font-heading text-3xl text-navy">Fecha y hora</h2><p className="mt-3 text-sm text-muted-foreground">Atendemos de lunes a sábado, entre 09:00 y 18:00.</p><input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(event) => { setDate(event.target.value); setTime(""); }} className="mt-7 h-11 rounded-xl border px-4" /><div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-5">{slots.map((item) => <button type="button" key={item} disabled={occupied.includes(item)} onClick={() => setTime(item)} className={`rounded-xl border px-3 py-3 text-sm ${occupied.includes(item) ? "cursor-not-allowed bg-muted text-muted-foreground line-through" : time === item ? "border-gold bg-[#f5f1e8] text-navy" : ""}`}>{item}</button>)}</div></div>}
        {step === 4 && <div><h2 className="mt-3 font-heading text-3xl text-navy">Sus datos básicos</h2><div className="mt-7 grid gap-4 sm:grid-cols-2"><input className="h-11 rounded-xl border px-4" placeholder="Nombre" value={values.firstName} onChange={(event) => update("firstName", event.target.value)} /><input className="h-11 rounded-xl border px-4" placeholder="Apellido" value={values.lastName} onChange={(event) => update("lastName", event.target.value)} /><input disabled={Boolean(patient?.documentId)} className="h-11 rounded-xl border px-4 disabled:cursor-not-allowed disabled:bg-muted" placeholder="Cédula o pasaporte" value={values.documentId} onChange={(event) => update("documentId", event.target.value)} /><input className="h-11 rounded-xl border px-4" type="email" placeholder="Correo electrónico" value={values.email} onChange={(event) => update("email", event.target.value)} /><input className="h-11 rounded-xl border px-4" placeholder="Teléfono" value={values.phone} onChange={(event) => update("phone", event.target.value)} /><input className="h-11 rounded-xl border px-4" placeholder="Ciudad" value={values.city} onChange={(event) => update("city", event.target.value)} /></div><p className="mt-5 text-sm text-muted-foreground">Al continuar acepta la política de privacidad de SILHO.</p></div>}
        {step === 5 && <div><h2 className="mt-3 font-heading text-3xl text-navy">Antecedentes esenciales</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Sólo lo esencial para preparar su valoración. Su historia clínica completa se registra en la consulta, con su consentimiento.</p><div className="mt-7 grid gap-3 sm:grid-cols-2">{[["allergies", "Alergias conocidas"], ["pregnancy", "Embarazo o lactancia"], ["recentTreatments", "Tratamientos faciales en los últimos 12 meses"], ["medication", "Medicación relevante"]].map(([key, label]) => <label key={key} className="flex items-center gap-3 rounded-xl border p-4 text-sm"><input type="checkbox" checked={Boolean(values[key as keyof typeof values])} onChange={(event) => update(key as keyof typeof values, event.target.checked)} />{label}</label>)}</div><textarea value={values.notes} onChange={(event) => update("notes", event.target.value)} maxLength={500} placeholder="Algo que el médico deba saber (opcional)" className="mt-4 min-h-28 w-full rounded-xl border p-4 text-sm" /></div>}
        {step === 6 && <div><h2 className="mt-3 font-heading text-3xl text-navy">Beneficio web y puntos</h2><div className="mt-6 rounded-2xl bg-[#f5f1e8] p-5 text-sm"><p className="font-semibold text-navy">Beneficio web</p><p className="mt-2">PayPhone aplica un {webDiscount}% de descuento. La oferta vigente hasta {offerUntil}; el bono de USD {bonusUsd} aplica si agenda tratamiento dentro de {bonusDays} días.</p></div><input value={referralCode} onChange={(event) => setReferralCode(event.target.value)} placeholder="Código de referido (opcional)" className="mt-5 h-11 w-full rounded-xl border px-4" />{patient ? <div className="mt-5 rounded-2xl border p-5"><p className="text-sm font-semibold text-navy">Puntos disponibles: {pointsBalance}</p><input type="number" min={0} max={maxPoints} step={100} value={pointsRedeemed} onChange={(event) => setPointsRedeemed(Math.max(0, Number(event.target.value) || 0))} className="mt-3 h-11 w-full rounded-xl border px-4" /><p className="mt-2 text-xs text-muted-foreground">Puede usar múltiplos de 100 puntos hasta {maxPoints}.</p></div> : <p className="mt-5 text-sm text-muted-foreground">Ingrese a <Link href="/cuenta/ingresar" className="font-semibold text-navy">Mi cuenta</Link> para usar sus puntos.</p>}</div>}
        {step === 7 && <div><h2 className="mt-3 font-heading text-3xl text-navy">Confirme su reserva</h2><div className="mt-6 rounded-2xl border p-5 text-sm"><p className="font-semibold text-navy">{selectedRoute?.name ?? "Valoración facial"} · {location?.city}</p><p className="mt-2 text-muted-foreground">{date} · {time}</p><div className="mt-5 space-y-2 border-t pt-4"><div className="flex justify-between"><span>Precio regular</span><span className={paymentMethod === "PAYPHONE" ? "line-through text-muted-foreground" : ""}>${service.basePrice.toFixed(2)}</span></div>{paymentMethod === "PAYPHONE" && <div className="flex justify-between"><span>Precio web</span><span className="font-semibold text-gold">${webBreakdown.discounted.toFixed(2)}</span></div>}{paymentMethod !== "PAYPHONE" && <div className="flex justify-between"><span>Beneficio web</span><span>Sin beneficio web</span></div>}{pointsRedeemed > 0 && <div className="flex justify-between"><span>Puntos</span><span>-{pointsRedeemed} puntos</span></div>}<div className="flex justify-between border-t pt-3 font-semibold text-navy"><span>Total estimado</span><span>${previewTotal.toFixed(2)}</span></div></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><label className={`cursor-pointer rounded-xl border p-4 text-sm ${paymentMethod === "PAYPHONE" ? "border-gold bg-[#f5f1e8]" : ""}`}><input type="radio" className="sr-only" checked={paymentMethod === "PAYPHONE"} onChange={() => setPaymentMethod("PAYPHONE")} /><span className="block font-semibold text-navy">Pagar ahora con PayPhone (precio web)</span><span className="mt-2 inline-flex rounded-full bg-gold px-2.5 py-1 text-xs font-semibold text-ink">Ahorra ${webBreakdown.savings.toFixed(2)} (-{webDiscount}%)</span></label><label className={`cursor-pointer rounded-xl border p-4 text-sm ${paymentMethod === "CASH" ? "border-gold bg-[#f5f1e8]" : ""}`}><input type="radio" className="sr-only" checked={paymentMethod === "CASH"} onChange={() => setPaymentMethod("CASH")} /><span className="block font-semibold text-navy">Pagar en clínica</span><span className="mt-2 block text-xs text-muted-foreground">Sin beneficio web · precio regular</span></label><label className={`cursor-pointer rounded-xl border p-4 text-sm ${paymentMethod === "TRANSFER" ? "border-gold bg-[#f5f1e8]" : ""}`}><input type="radio" className="sr-only" checked={paymentMethod === "TRANSFER"} onChange={() => setPaymentMethod("TRANSFER")} /><span className="block font-semibold text-navy">Transferencia</span><span className="mt-2 block text-xs text-muted-foreground">Sin beneficio web · precio regular</span></label></div><div className="mt-4 rounded-xl bg-[#fafaf9] p-4 text-sm"><span className="text-muted-foreground">{paymentMethod === "PAYPHONE" ? "Resumen pagando en línea" : "Resumen"}</span><div className="mt-2">{paymentMethod === "PAYPHONE" ? <><span className="line-through text-muted-foreground">${service.basePrice.toFixed(2)}</span><span className="mx-2">→</span><span className="font-semibold text-navy">${previewTotal.toFixed(2)}</span></> : <span>Sin beneficio web · ${previewTotal.toFixed(2)}</span>}</div></div><label className="mt-5 flex items-start gap-3 text-sm text-muted-foreground"><input type="checkbox" checked={acceptTerms} onChange={(event) => setAcceptTerms(event.target.checked)} />Acepto términos y condiciones y la <Link href="/politicas" className="font-semibold text-navy">política de citas</Link>.</label><p className="mt-4 text-xs text-muted-foreground">En pagos CASH o TRANSFER, la reserva queda pendiente y el total corresponde al precio regular.</p></div>}
        {message && <p className="mt-6 text-sm text-red-700">{message}</p>}
        {step === 7 && !acceptTerms && <p className="mt-4 text-sm text-red-700">Debe aceptar los términos para continuar.</p>}
        <div className="mt-8 flex justify-between gap-3">
          {step > 1 && <Button type="button" variant="outline" onClick={() => setStep((current) => current - 1)} className="rounded-full"><ArrowLeft className="size-4" />Atrás</Button>}
          {step < 7 ? <Button type="button" onClick={next} className="ml-auto rounded-full bg-navy text-white hover:bg-navy/90">Continuar <ArrowRight className="size-4" /></Button> : <Button type="button" disabled={loading || !acceptTerms} onClick={submit} className="ml-auto rounded-full bg-gold text-ink hover:bg-gold-light">{loading ? "Enviando…" : "Confirmar reserva"} <Check className="size-4" /></Button>}
        </div>
      </div>
    </div>
  );
}
