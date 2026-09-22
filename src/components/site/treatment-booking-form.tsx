"use client";

import { FormEvent, useState } from "react";
import { track } from "@/lib/analytics";

type Props = { service: { id: string; name: string; base: number; web: number; savings: number }; locations: { id: string; name: string; city: string }[] };

export function TreatmentBookingForm({ service, locations }: Props) {
  const [status, setStatus] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Enviando…");
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form.entries());
    const location = locations.find((item) => item.id === data.locationId);
    const response = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...data, ciudad: location?.city, serviceId: service.id, pointsRedeemed: 0, acceptTerms: form.get("acceptTerms") === "on", acceptDataConsent: form.get("acceptDataConsent") === "on", paymentMethod: data.paymentMethod ?? "PAYPHONE" }) });
    const result = await response.json();
    if (!response.ok) { setStatus(result.error ?? "No pudimos enviar la solicitud."); return; }
    track("booking_submit", { service: service.id, method: String(data.paymentMethod ?? "TRANSFER") });
    if (result.redirectUrl) window.location.href = result.redirectUrl;
    else setStatus("Solicitud recibida. Le contactaremos para confirmar su cita.");
  }
  return <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm"><div className="grid gap-4 sm:grid-cols-2"><input name="nombre" required placeholder="Nombre" className="rounded-xl border px-4 py-3" /><input name="apellido" required placeholder="Apellido" className="rounded-xl border px-4 py-3" /><input name="documentId" required placeholder="Cédula o pasaporte" className="rounded-xl border px-4 py-3" /><input name="telefono" required placeholder="WhatsApp / teléfono" className="rounded-xl border px-4 py-3" /><input name="email" type="email" required placeholder="Correo electrónico" className="rounded-xl border px-4 py-3" /><select name="locationId" required className="rounded-xl border px-4 py-3">{locations.map((location) => <option key={location.id} value={location.id}>{location.city === location.name ? location.city : `${location.city} · ${location.name}`}</option>)}</select><label className="text-sm text-muted-foreground"><span className="mb-1 block font-medium text-navy">Fecha preferida</span><input name="preferredDate" type="date" required className="w-full rounded-xl border px-4 py-3" /></label><label className="text-sm text-muted-foreground"><span className="mb-1 block font-medium text-navy">Franja horaria preferida</span><select name="preferredSlot" required className="w-full rounded-xl border px-4 py-3"><option>Mañana 09-12</option><option>Tarde 14-18</option></select></label></div><textarea name="patientGoal" maxLength={500} placeholder="¿Qué le gustaría mejorar? (opcional)" className="min-h-24 w-full rounded-xl border px-4 py-3" /><div className="rounded-xl bg-[#f5f1e8] p-4 text-sm"><p>Precio regular: <span className="line-through">${service.base.toFixed(2)}</span></p><p className="text-2xl font-semibold text-navy">${service.web.toFixed(2)} <span className="text-sm font-normal">· ahorra ${service.savings.toFixed(2)} pagando en línea</span></p></div><div className="flex flex-wrap gap-3"><label className="flex items-center gap-2 text-sm"><input type="radio" name="paymentMethod" value="PAYPHONE" defaultChecked /> Pagar ahora con PayPhone</label><label className="flex items-center gap-2 text-sm"><input type="radio" name="paymentMethod" value="TRANSFER" /> Reservar ahora y pagar en la sede (transferencia o efectivo)</label></div><details className="rounded-xl border px-4 py-3 text-sm"><summary className="cursor-pointer font-semibold text-navy">Rewards y referidos</summary><p className="mt-2 text-muted-foreground">Los puntos y códigos de referido se administran desde Mi cuenta después de confirmar la reserva.</p></details><label className="flex gap-2 text-sm"><input type="checkbox" name="acceptDataConsent" required /> Acepto el tratamiento de mis datos para gestionar esta solicitud.</label><label className="flex gap-2 text-sm"><input type="checkbox" name="acceptTerms" required /> Acepto los términos y condiciones.</label><button className="w-full rounded-full bg-navy px-5 py-3 font-semibold text-white">Solicitar agendamiento</button>{status && <p className="text-sm text-muted-foreground">{status}</p>}</form>;
}
