"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Building2, CalendarDays, CreditCard, Database, FileImage, HeartPulse, LayoutDashboard, LogOut, Menu, Settings, Stethoscope, Tag, Users, Wallet, X, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { logoutAction } from "./actions";

const links: [string, string, LucideIcon][] = [["/admin", "Dashboard", LayoutDashboard], ["/admin/servicios", "Servicios", Stethoscope], ["/admin/categorias", "Categorías", Tag], ["/admin/pacientes", "Pacientes", Users], ["/admin/leads", "Leads", HeartPulse], ["/admin/citas", "Citas", CalendarDays], ["/admin/pedidos", "Pedidos / Pagos", Wallet], ["/admin/rewards", "Recompensas", Wallet], ["/admin/suscripciones", "Suscripciones", CreditCard], ["/admin/antes-y-despues", "Antes y después", FileImage], ["/admin/blog", "Blog", BookOpen], ["/admin/sedes", "Sedes", Building2], ["/admin/profesional", "Profesional", Database], ["/admin/configuracion", "Configuración", Settings]];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = <nav className="space-y-1">{links.map(([href, label, Icon]) => { const Component = Icon as typeof LayoutDashboard; return <Link key={String(href)} href={String(href)} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${pathname === href ? "bg-gold text-ink" : "text-white/70 hover:bg-white/10 hover:text-white"}`}><Component className="size-4" />{label}</Link>; })}</nav>;
  return <div className="min-h-screen bg-[#f7f8fa] lg:flex"><button className="fixed right-4 top-4 z-30 rounded-lg bg-navy p-2 text-white lg:hidden" onClick={() => setOpen(!open)} aria-label="Menú">{open ? <X /> : <Menu />}</button><aside className={`fixed inset-y-0 left-0 z-20 w-72 bg-navy p-5 transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}><div className="mb-10 px-3"><p className="font-heading text-2xl tracking-[0.25em] text-white">SILHO</p><p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-gold">Administración</p></div>{nav}<form action={logoutAction} className="mt-8 border-t border-white/10 pt-5"><button className="flex items-center gap-3 px-3 py-2 text-sm text-white/60 hover:text-white"><LogOut className="size-4" />Cerrar sesión</button></form></aside><section className="min-w-0 flex-1 px-5 py-8 lg:px-10"><div className="mx-auto max-w-7xl">{children}</div></section></div>;
}

export function AdminHeading({ eyebrow = "Administración SILHO", title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-gold">{eyebrow}</p><h1 className="mt-2 font-heading text-4xl text-navy">{title}</h1></div>{action}</div>;
}
