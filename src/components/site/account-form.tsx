"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "register" | "login";

export function AccountForm({ mode, next = "/cuenta" }: { mode: Mode; next?: string }) {
  const [message, setMessage] = useState("");
  const [claimCode, setClaimCode] = useState("");
  const [claimSent, setClaimSent] = useState(false);
  const [claimRequired, setClaimRequired] = useState(false);
  const [claimSending, setClaimSending] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    if (mode === "register") {
      setClaimError("");
      if (claimRequired && !/^\d{6}$/.test(claimCode)) {
        setClaimError("Ingrese el código de 6 dígitos para vincular su historial.");
        setLoading(false);
        return;
      }
    }
    const values = { ...Object.fromEntries(new FormData(event.currentTarget)), ...(claimCode ? { claimCode } : {}) };
    try {
      const response = await fetch(`/api/account/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await response.json();
      if (response.ok) window.location.href = mode === "login" ? next : "/cuenta";
      else if (mode === "register" && data.error === "Debe verificar su correo para vincular su historial.") {
        setMessage("");
        setClaimCode("");
        setClaimSent(false);
        setClaimRequired(true);
        await sendClaimCode();
      } else {
        setMessage(data.error ?? "No pudimos completar la solicitud.");
      }
    } catch {
      setMessage("No pudimos completar la solicitud. Inténtelo nuevamente.");
    }
    setLoading(false);
  }
  if (mode === "login") {
    return <form ref={formRef} onSubmit={submit} className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm"><Input name="email" type="email" required placeholder="Correo electrónico" /><Input name="password" type="password" required placeholder="Contraseña" /><p className="text-sm text-muted-foreground">¿Aún no tiene cuenta? <Link href="/cuenta/registro" className="font-semibold text-navy">Regístrese aquí.</Link></p>{message && <p className="text-sm text-red-700">{message}</p>}<Button type="submit" disabled={loading} className="w-full rounded-full bg-navy text-white hover:bg-navy/90">{loading ? "Ingresando…" : "Ingresar"}</Button></form>;
  }
  async function sendClaimCode() {
    const form = formRef.current;
    if (!form) return;
    const values = Object.fromEntries(new FormData(form));
    const email = String(values.email ?? "");
    setRegisterEmail(email);
    setClaimError("");
    setClaimSent(false);
    setClaimSending(true);
    try {
      const response = await fetch("/api/cuenta/claim-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentId: values.documentId, email, phone: values.phone }) });
      const data = await response.json();
      if (!response.ok) {
        setClaimError(data.error ?? "No pudimos enviar el código.");
        return;
      }
      setClaimSent(true);
    } catch {
      setClaimError("No pudimos enviar el código. Inténtelo nuevamente.");
    } finally {
      setClaimSending(false);
    }
  }
  return <form ref={formRef} onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm"><div className="grid gap-4 sm:grid-cols-2"><Input name="firstName" required placeholder="Nombre" /><Input name="lastName" required placeholder="Apellido" /></div><Input name="documentId" required placeholder="Cédula o pasaporte" /><Input name="email" type="email" required placeholder="Correo electrónico" value={registerEmail} onChange={(event) => setRegisterEmail(event.target.value)} /><Input name="phone" required placeholder="Teléfono" /><Input name="city" placeholder="Ciudad (opcional)" /><Input name="password" type="password" minLength={8} required placeholder="Contraseña (mínimo 8 caracteres)" /><Input name="referralCode" placeholder="Código de referido (opcional)" />{claimRequired && <div className="space-y-3 rounded-xl border border-gold/40 bg-[#f5f1e8] p-4"><div className="space-y-1"><p className="font-semibold text-navy">Encontramos su historial como paciente SILHO</p><p className="text-sm leading-6 text-muted-foreground">Para vincularlo a su nueva cuenta, enviamos un código de 6 dígitos a <strong className="text-navy">{registerEmail}</strong>. Ingréselo aquí y vuelva a pulsar «Crear cuenta».</p></div><Input autoFocus value={claimCode} onChange={(event) => { setClaimCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setClaimError(""); }} inputMode="numeric" maxLength={6} placeholder="Código de 6 dígitos" /><Button type="button" variant="outline" onClick={sendClaimCode} disabled={claimSending}>{claimSending ? "Enviando…" : "Reenviar código"}</Button>{claimSent && <p className="text-xs font-medium text-emerald-700">Código enviado a {registerEmail}. Revise también la carpeta de spam.</p>}{claimError && <p role="alert" className="text-sm text-red-700">{claimError}</p>}</div>}<p className="text-sm text-muted-foreground">¿Ya tiene una cuenta? <Link href="/cuenta/ingresar" className="font-semibold text-navy">Ingrese aquí.</Link></p>{message && <p className="text-sm text-red-700">{message}</p>}<Button type="submit" disabled={loading || (claimRequired && claimCode.length !== 6)} className="w-full rounded-full bg-navy text-white hover:bg-navy/90">{loading ? "Creando cuenta…" : claimRequired ? "Vincular historial y crear cuenta" : "Crear cuenta"}</Button></form>;
}
