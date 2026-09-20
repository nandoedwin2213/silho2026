"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = { serviceId: string; serviceName: string; base: number; discount: number; total: number };

export function CheckoutForm({ serviceId, serviceName, base, discount, total }: Props) {
  const [method, setMethod] = useState("PAYPHONE");
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accepted) { setMessage("Debes aceptar los términos para continuar."); return; }
    setLoading(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, serviceId, paymentMethod: method, acceptTerms: true }) });
    const data = await response.json();
    if (data.redirectUrl) window.location.href = data.redirectUrl;
    else if (data.orderId) window.location.href = `/checkout/gracias/${data.orderId}${data.status === "PENDING_CONFIGURATION" ? "?configuracion=pendiente" : ""}`;
    else setMessage(data.error ?? "No pudimos procesar tu solicitud.");
    setLoading(false);
  }
  return <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm md:p-8"><div className="grid gap-4 sm:grid-cols-2"><Input name="nombre" required placeholder="Nombre" /><Input name="apellido" required placeholder="Apellido" /><Input name="documentId" required placeholder="Cédula o pasaporte" /><Input name="email" required type="email" placeholder="Correo electrónico" /><Input name="telefono" required placeholder="Teléfono" /><Input name="ciudad" required placeholder="Ciudad" /></div><div className="grid gap-4 sm:grid-cols-2"><Input name="referralCode" placeholder="Código de referido (opcional)" /><Input name="pointsRedeemed" type="number" min="0" step="100" placeholder="Puntos a canjear (opcional)" /></div><div className="rounded-2xl bg-[#fafaf9] p-5"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Resumen</p><div className="mt-4 flex justify-between text-sm"><span>{serviceName}</span><span>${base.toFixed(2)}</span></div>{discount > 0 && <div className="mt-2 flex justify-between text-sm text-gold"><span>Beneficio web -{discount}% en PayPhone</span><span>-${(base - total).toFixed(2)}</span></div>}<div className="mt-4 flex justify-between border-t pt-4 font-semibold text-navy"><span>Total calculado en servidor</span><span>${total.toFixed(2)}</span></div></div><div><Label>Método de pago</Label><div className="mt-3 grid gap-3 sm:grid-cols-3">{[["PAYPHONE", "PayPhone · precio web"], ["TRANSFER", "Transferencia · precio regular"], ["CASH", "Efectivo en clínica · precio regular"]].map(([value, label]) => <label key={value} className={`cursor-pointer rounded-xl border p-4 text-sm ${method === value ? "border-navy bg-navy/5" : "border-border"}`}><input type="radio" name="payment" value={value} checked={method === value} onChange={() => setMethod(value)} className="sr-only" />{label}</label>)}</div></div><label className="flex items-start gap-3 text-sm text-muted-foreground"><Checkbox checked={accepted} onCheckedChange={(value) => setAccepted(value === true)} /><span>Acepto los términos y condiciones y autorizo el tratamiento de mis datos.</span></label>{message && <p className="text-sm text-red-700">{message}</p>}<Button type="submit" disabled={loading} className="rounded-full bg-navy text-white hover:bg-navy/90">{loading ? "Procesando…" : "Confirmar solicitud"}</Button></form>;
}
