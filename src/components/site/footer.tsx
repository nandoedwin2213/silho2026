import Link from "next/link";
import { Camera, Mail, MapPin, Music2, Phone, Users } from "lucide-react";
import { navLinks, patientLinks } from "@/lib/nav";

type FooterProps = {
  locations: { name: string; city: string; address: string; mapsUrl?: string | null }[];
  settings: Record<string, string | null>;
};

export function Footer({ locations, settings }: FooterProps) {
  return (
    <footer className="border-t border-border bg-[#fafaf9]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-4 lg:px-10">
        <div>
          <p className="font-heading text-2xl tracking-[0.25em] text-navy">SILHO</p>
          <p className="mt-2 text-sm text-gold">Medicina Estética</p>
          <p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">Clínica de medicina estética facial · Dr. Edwin Ayala</p>
          <div className="mt-6 flex gap-3">
            {settings.INSTAGRAM_URL && <a href={settings.INSTAGRAM_URL} aria-label="Instagram" className="rounded-full border p-2 text-navy transition hover:bg-white"><Camera className="size-4" /></a>}
            {settings.TIKTOK_URL && <a href={settings.TIKTOK_URL} aria-label="TikTok" className="rounded-full border p-2 text-navy transition hover:bg-white"><Music2 className="size-4" /></a>}
            {settings.FACEBOOK_URL && <a href={settings.FACEBOOK_URL} aria-label="Facebook" className="rounded-full border p-2 text-navy transition hover:bg-white"><Users className="size-4" /></a>}
          </div>
        </div>
        <div>
          <p className="font-semibold text-navy">Rutas</p>
          <nav className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">{navLinks.slice(1, 4).map(([href, label]) => <Link key={href} href={href} className="transition hover:text-navy">{label}</Link>)}</nav>
        </div>
        <div>
          <p className="font-semibold text-navy">Pacientes</p>
          <nav className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">{patientLinks.map(([href, label]) => <Link key={href} href={href} className="transition hover:text-navy">{label}</Link>)}</nav>
        </div>
        <div>
          <p className="font-semibold text-navy">Sedes y legal</p>
          <div className="mt-4 space-y-3">{locations.map((location) => <div key={location.name} className="flex gap-2 text-sm text-muted-foreground"><MapPin className="mt-0.5 size-4 shrink-0 text-gold" /><span>{location.city}<br />{location.address}{location.mapsUrl && <><br /><a href={location.mapsUrl} target="_blank" rel="noreferrer" className="text-navy hover:text-gold">Ver mapa →</a></>}</span></div>)}</div>
          <p className="mt-4 text-sm text-muted-foreground">{settings.CLINIC_HOURS ?? "Lunes a sábado, 09:00–18:00"}</p>
          <nav className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
            <Link href="/contacto" className="transition hover:text-navy">Contacto</Link><Link href="/privacidad" className="transition hover:text-navy">Privacidad</Link><Link href="/terminos" className="transition hover:text-navy">Términos</Link><Link href="/consentimiento-datos" className="transition hover:text-navy">Consentimiento</Link><Link href="/politicas" className="transition hover:text-navy">Políticas de cita</Link>
          </nav>
          <div className="mt-5 space-y-2 text-sm text-muted-foreground"><a href={`https://wa.me/${settings.WHATSAPP_NUMBER ?? "593989049001"}`} className="flex items-center gap-2 hover:text-navy"><Phone className="size-4 text-gold" /> WhatsApp</a>{settings.CLINIC_EMAIL && <a href={`mailto:${settings.CLINIC_EMAIL}`} className="flex items-center gap-2 hover:text-navy"><Mail className="size-4 text-gold" /> {settings.CLINIC_EMAIL}</a>}</div>
        </div>
      </div>
      <div className="border-t border-border px-6 py-5 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} SILHO. Todos los derechos reservados. <a href="https://unsplash.com/license" target="_blank" rel="noreferrer" className="transition hover:text-navy">Fotografías: Unsplash</a></div>
    </footer>
  );
}
