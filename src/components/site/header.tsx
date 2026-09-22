import Link from "next/link";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";
import { navLinks } from "@/lib/nav";

export function Header() {
  return (
    <header className="border-b border-border/70 bg-white/95">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link href="/" className="shrink-0">
          <span className="block font-heading text-xl font-semibold tracking-[0.25em] text-navy">SILHO</span>
          <span className="block text-[0.58rem] uppercase tracking-[0.25em] text-gold">Medicina Estética</span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.slice(0, 6).map(([href, label]) => <Link key={href} href={href} className="text-sm text-muted-foreground transition hover:text-navy">{label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/cuenta" className="hidden items-center gap-1.5 px-2 text-sm text-muted-foreground transition hover:text-navy sm:inline-flex"><User className="size-4" /> Mi cuenta</Link>
          <Button asChild className="hidden rounded-full bg-navy px-5 text-white hover:bg-navy/90 sm:inline-flex"><Link href="/reservar">Reservar valoración</Link></Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
