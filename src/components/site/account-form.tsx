"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "register" | "login";

export function AccountForm({ mode }: { mode: Mode }) {
  const [message, setMessage] = useState("");
  const [claimCode, setClaimCode] = useState("");
  const [claimSent, setClaimSent] = useState(false);
  const [claimRequired, setClaimRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const values = { ...Object.fromEntries(new FormData(event.currentTarget)), ...(claimCode ? { claimCode } : {}) };
    const response = await fetch(`/api/account/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const data = await response.json();
    if (response.ok) window.location.href = "/cuenta";
    else {
      setMessage(data.error ?? "No pudimos completar la solicitud.");
      if (mode === "register" && data.error === "Debe verificar su correo para vincular su historial.") { setClaimSent(false); setClaimRequired(true); }
    }
    setLoading(false);
  }
  if (mode === "login") {
    return <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm"><Input name="email" type="email" required placeholder="Correo electrónico" /><Input name="password" type="password" required placeholder="Contraseña" /><p className="text-sm text-muted-foreground">¿Aún no tiene cuenta? <Link href="/cuenta/registro" className="font-semibold text-navy">Regístrese aquí.</Link></p>{message && <p className="text-sm text-red-700">{message}</p>}<Button disabled={loading} className="w-full rounded-full bg-navy text-white hover:bg-navy/90">{loading ? "Ingresando…" : "Ingresar"}</Button></form>;
  }
  async function sendClaimCode() {
    const form = document.querySelector("form");
    if (!form) return;
    const values = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/cuenta/claim-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentId: values.documentId, email: values.email }) });
    const data = await response.json();
    setMessage(data.error ?? (response.ok ? "Código enviado. Revise su correo." : "No pudimos enviar el código."));
    if (response.ok) setClaimSent(true);
  }
  return <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm"><div className="grid gap-4 sm:grid-cols-2"><Input name="firstName" required placeholder="Nombre" /><Input name="lastName" required placeholder="Apellido" /></div><Input name="documentId" required placeholder="Cédula o pasaporte" /><Input name="email" type="email" required placeholder="Correo electrónico" /><Input name="phone" required placeholder="Teléfono" /><Input name="city" placeholder="Ciudad (opcional)" /><Input name="password" type="password" minLength={8} required placeholder="Contraseña (mínimo 8 caracteres)" /><Input name="referralCode" placeholder="Código de referido (opcional)" />{claimRequired && <div className="space-y-3 rounded-xl border border-gold/40 bg-[#f5f1e8] p-4"><Button type="button" variant="outline" onClick={sendClaimCode} disabled={claimSent}>{claimSent ? "Código enviado" : "Enviar código de verificación"}</Button><Input value={claimCode} onChange={(event) => setClaimCode(event.target.value)} inputMode="numeric" maxLength={6} placeholder="Código de 6 dígitos" /></div>}<p className="text-sm text-muted-foreground">¿Ya tiene una cuenta? <Link href="/cuenta/ingresar" className="font-semibold text-navy">Ingrese aquí.</Link></p>{message && <p className="text-sm text-red-700">{message}</p>}<Button disabled={loading} className="w-full rounded-full bg-navy text-white hover:bg-navy/90">{loading ? "Creando cuenta…" : "Crear cuenta"}</Button></form>;
}
