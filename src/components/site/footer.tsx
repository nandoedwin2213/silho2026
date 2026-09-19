import Link from "next/link";
import { Camera, MapPin, Music2, Users } from "lucide-react";

type FooterProps = {
  locations: { name: string; city: string; address: string }[];
  settings: Record<string, string | null>;
};

export function Footer({ locations, settings }: FooterProps) {
  return (
    <footer className="border-t border-border bg-[#fafaf9]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <p className="font-heading text-2xl tracking-[0.25em] text-navy">SILHO</p>
          <p className="mt-2 text-sm text-gold">Medicina Estética</p>
          <p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">Medicina estética diseñada alrededor de ti, con valoración médica personalizada.</p>
          <div className="mt-6 flex gap-3">
            {settings.INSTAGRAM_URL && <a href={settings.INSTAGRAM_URL} aria-label="Instagram" className="rounded-full border p-2 text-navy transition hover:bg-white"><Camera className="size-4" /></a>}
            {settings.TIKTOK_URL && <a href={settings.TIKTOK_URL} aria-label="TikTok" className="rounded-full border p-2 text-navy transition hover:bg-white"><Music2 className="size-4" /></a>}
            {settings.FACEBOOK_URL && <a href={settings.FACEBOOK_URL} aria-label="Facebook" className="rounded-full border p-2 text-navy transition hover:bg-white"><Users className="size-4" /></a>}
          </div>
        </div>
        <div>
          <p className="font-semibold text-navy">Sedes</p>
          <div className="mt-4 space-y-3">{locations.map((location) => <div key={location.name} className="flex gap-2 text-sm text-muted-foreground"><MapPin className="mt-0.5 size-4 shrink-0 text-gold" /><span>{location.city}<br />{location.address}</span></div>)}</div>
        </div>
        <div>
          <p className="font-semibold text-navy">Información</p>
          <nav className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
            <Link href="/contacto" className="transition hover:text-navy">Contacto</Link><Link href="/agenda" className="transition hover:text-navy">Agenda</Link><Link href="/privacidad" className="transition hover:text-navy">Política de privacidad</Link><Link href="/terminos" className="transition hover:text-navy">Términos</Link><Link href="/consentimiento-datos" className="transition hover:text-navy">Consentimiento de datos</Link>
          </nav>
        </div>
      </div>
      <div className="border-t border-border px-6 py-5 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} SILHO. Todos los derechos reservados.</div>
    </footer>
  );
}
