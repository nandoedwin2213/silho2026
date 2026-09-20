"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { navLinks } from "@/lib/nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú"><Menu /></Button></SheetTrigger>
      <SheetContent side="right" className="w-[min(88vw,360px)]">
        <SheetHeader><SheetTitle className="font-heading text-left text-navy">SILHO</SheetTitle></SheetHeader>
        <nav className="mt-8 flex flex-col gap-2">
          {navLinks.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-lg text-navy transition hover:bg-muted">{label}</Link>)}
          <Link href="/cuenta" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-lg text-navy transition hover:bg-muted">Mi cuenta</Link>
          <Link href="/reservar" onClick={() => setOpen(false)} className="mt-4 rounded-full bg-navy px-5 py-3 text-center text-sm font-semibold text-white">Reservar valoración</Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
