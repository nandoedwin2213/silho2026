"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  useEffect(() => { if (state?.error) toast.error(state.error); }, [state]);
  return <form action={action} className="space-y-5 rounded-2xl border bg-white p-7 shadow-sm"><Input name="email" type="email" required placeholder="Correo electrónico" /><Input name="password" type="password" required placeholder="Contraseña" /><Button type="submit" disabled={pending} className="w-full rounded-full bg-navy text-white hover:bg-navy/90">{pending ? "Ingresando…" : "Ingresar"}</Button></form>;
}
