"use client";

import { useState } from "react";

type Values = { discount: string; whatsapp: string; instagram: string; tiktok: string; facebook: string; surgical: boolean; email: string; instructions: string };

export function SettingsForm({ initial }: { initial: Values }) {
  const [values, setValues] = useState(initial);
  const [message, setMessage] = useState("");
  const update = (key: keyof Values, value: string | boolean) => setValues((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/admin/settings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...values, discount: Number(values.discount) }) });
    setMessage(response.ok ? "Configuración guardada." : "No se pudo guardar la configuración.");
  }
  return <form onSubmit={submit} className="grid gap-5 rounded-2xl border bg-white p-6 shadow-sm md:grid-cols-2"><label className="text-sm">Descuento pronto pago<input name="discount" type="number" min="0" max="50" value={values.discount} onChange={(event) => update("discount", event.target.value)} className="mt-2 h-9 w-full rounded-lg border px-3" /></label><label className="text-sm">WhatsApp<input name="whatsapp" value={values.whatsapp} onChange={(event) => update("whatsapp", event.target.value)} className="mt-2 h-9 w-full rounded-lg border px-3" /></label><label className="text-sm">Instagram<input name="instagram" value={values.instagram} onChange={(event) => update("instagram", event.target.value)} className="mt-2 h-9 w-full rounded-lg border px-3" /></label><label className="text-sm">TikTok<input name="tiktok" value={values.tiktok} onChange={(event) => update("tiktok", event.target.value)} className="mt-2 h-9 w-full rounded-lg border px-3" /></label><label className="text-sm">Facebook<input name="facebook" value={values.facebook} onChange={(event) => update("facebook", event.target.value)} className="mt-2 h-9 w-full rounded-lg border px-3" /></label><label className="text-sm">Correo de clínica<input name="email" type="email" value={values.email} onChange={(event) => update("email", event.target.value)} className="mt-2 h-9 w-full rounded-lg border px-3" /></label><label className="flex items-center gap-3 text-sm"><input type="checkbox" name="surgical" checked={values.surgical} onChange={(event) => update("surgical", event.target.checked)} /> Mostrar precios quirúrgicos</label><textarea name="instructions" value={values.instructions} onChange={(event) => update("instructions", event.target.value)} rows={4} placeholder="Instrucciones de transferencia" className="rounded-lg border p-3 text-sm md:col-span-2" /><button type="submit" className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white md:col-span-2">Guardar configuración</button>{message && <p className="text-sm text-muted-foreground md:col-span-2">{message}</p>}</form>;
}
