import type { Metadata } from "next";
import { AccountForm } from "@/components/site/account-form";

export const metadata: Metadata = { title: "Crear cuenta", description: "Cree su cuenta SILHO para consultar citas y puntos." };

export default function RegisterPage() {
  return <main className="mx-auto max-w-xl px-6 py-16 lg:py-24"><p className="text-xs uppercase tracking-[0.22em] text-gold">SILHO Face Rewards</p><h1 className="mt-4 font-heading text-4xl text-navy">Crear cuenta</h1><p className="mt-4 leading-7 text-muted-foreground">Guarde su información, consulte sus citas y acumule puntos en acciones elegibles.</p><div className="mt-8"><AccountForm mode="register" /></div></main>;
}
