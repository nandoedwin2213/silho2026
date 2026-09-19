"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const links = [
  ["/tratamientos", "Tratamientos"],
  ["/dr-edwin-ayala", "Dr. Edwin Ayala"],
  ["/trasplante-capilar", "Trasplante capilar"],
  ["/blog", "Blog"],
  ["/agenda", "Agenda"],
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú"><Menu /></Button></SheetTrigger>
      <SheetContent side="right" className="w-[min(88vw,360px)]">
        <SheetHeader><SheetTitle className="font-heading text-left text-navy">SILHO</SheetTitle></SheetHeader>
        <nav className="mt-8 flex flex-col gap-2">
          {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-lg text-navy transition hover:bg-muted">{label}</Link>)}
          <Link href="/agenda" onClick={() => setOpen(false)} className="mt-4 rounded-full bg-navy px-5 py-3 text-center text-sm font-semibold text-white">Agenda tu valoración</Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
