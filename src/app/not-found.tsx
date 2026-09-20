import Link from "next/link";

export default function NotFound() {
  return <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center"><p className="text-xs uppercase tracking-[0.24em] text-gold">SILHO</p><h1 className="mt-5 font-heading text-5xl text-navy">Página no encontrada</h1><p className="mt-4 text-muted-foreground">Explore una de nuestras rutas faciales o vuelva al inicio.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/rejuvenecimiento-facial" className="rounded-full border px-5 py-3 text-sm font-semibold text-navy">Rejuvenecimiento facial</Link><Link href="/acne" className="rounded-full border px-5 py-3 text-sm font-semibold text-navy">Acné</Link><Link href="/cicatrices-acne" className="rounded-full border px-5 py-3 text-sm font-semibold text-navy">Cicatrices de acné</Link></div></main>;
}
