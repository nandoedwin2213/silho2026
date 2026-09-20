import type { Metadata } from "next";
import { AccountForm } from "@/components/site/account-form";

export const metadata: Metadata = { title: "Ingresar a mi cuenta", description: "Ingrese a su cuenta SILHO." };

export default function LoginPage() {
  return <main className="mx-auto max-w-xl px-6 py-16 lg:py-24"><p className="text-xs uppercase tracking-[0.22em] text-gold">Área de pacientes</p><h1 className="mt-4 font-heading text-4xl text-navy">Ingresar a mi cuenta</h1><p className="mt-4 leading-7 text-muted-foreground">Consulte sus citas, órdenes y saldo de puntos.</p><div className="mt-8"><AccountForm mode="login" /></div></main>;
}
