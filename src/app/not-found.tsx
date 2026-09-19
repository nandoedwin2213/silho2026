import Link from "next/link";

export default function NotFound() {
  return <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center"><p className="text-xs uppercase tracking-[0.24em] text-gold">SILHO</p><h1 className="mt-5 font-heading text-5xl text-navy">Página no encontrada</h1><p className="mt-4 text-muted-foreground">Tal vez el contenido cambió o la dirección no es correcta.</p><Link href="/" className="mt-8 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">Volver al inicio</Link></main>;
}
