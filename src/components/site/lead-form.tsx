"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema } from "@/lib/validation/lead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { z } from "zod";
import { track } from "@/lib/analytics";

type LeadValues = z.input<typeof leadSchema>;

export function LeadForm({ interestedService, buttonLabel = "Enviar solicitud" }: { interestedService?: string; buttonLabel?: string }) {
  const [sent, setSent] = useState(false);
  const form = useForm<LeadValues, unknown, z.infer<typeof leadSchema>>({ resolver: zodResolver(leadSchema), defaultValues: { source: "WEB", interestedService: interestedService ?? "" } });
  async function onSubmit(values: LeadValues) {
    const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    if (response.ok) { track("lead_submit", { interestedService: interestedService ?? "" }); setSent(true); form.reset({ source: "WEB", interestedService: interestedService ?? "" }); }
  }
  if (sent) return <div className="rounded-2xl bg-[#f5f1e8] p-6 text-sm leading-6 text-navy">Gracias por escribirnos. Nuestro equipo se pondrá en contacto contigo para continuar.</div>;
  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Input placeholder="Nombre completo" {...form.register("name")} /><Input placeholder="Teléfono" {...form.register("phone")} /></div><Input type="email" placeholder="Correo electrónico (opcional)" {...form.register("email")} /><Textarea placeholder="¿Cómo podemos ayudarte?" rows={4} {...form.register("notes")} /><Button type="submit" className="rounded-full bg-navy text-white hover:bg-navy/90" disabled={form.formState.isSubmitting}>{buttonLabel}</Button></form>;
}
