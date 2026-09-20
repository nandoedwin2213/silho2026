"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "register" | "login";

export function AccountForm({ mode }: { mode: Mode }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch(`/api/account/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const data = await response.json();
    if (response.ok) window.location.href = "/cuenta";
    else setMessage(data.error ?? "No pudimos completar la solicitud.");
    setLoading(false);
  }
  if (mode === "login") {
    return <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm"><Input name="email" type="email" required placeholder="Correo electrónico" /><Input name="password" type="password" required placeholder="Contraseña" /><p className="text-sm text-muted-foreground">¿Aún no tiene cuenta? <Link href="/cuenta/registro" className="font-semibold text-navy">Regístrese aquí.</Link></p>{message && <p className="text-sm text-red-700">{message}</p>}<Button disabled={loading} className="w-full rounded-full bg-navy text-white hover:bg-navy/90">{loading ? "Ingresando…" : "Ingresar"}</Button></form>;
  }
  return <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm"><div className="grid gap-4 sm:grid-cols-2"><Input name="firstName" required placeholder="Nombre" /><Input name="lastName" required placeholder="Apellido" /></div><Input name="documentId" required placeholder="Cédula o pasaporte" /><Input name="email" type="email" required placeholder="Correo electrónico" /><Input name="phone" required placeholder="Teléfono" /><Input name="city" placeholder="Ciudad (opcional)" /><Input name="password" type="password" minLength={8} required placeholder="Contraseña (mínimo 8 caracteres)" /><Input name="referralCode" placeholder="Código de referido (opcional)" /><p className="text-sm text-muted-foreground">¿Ya tiene una cuenta? <Link href="/cuenta/ingresar" className="font-semibold text-navy">Ingrese aquí.</Link></p>{message && <p className="text-sm text-red-700">{message}</p>}<Button disabled={loading} className="w-full rounded-full bg-navy text-white hover:bg-navy/90">{loading ? "Creando cuenta…" : "Crear cuenta"}</Button></form>;
}
