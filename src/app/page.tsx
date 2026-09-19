import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div>
          <p className="font-heading text-2xl font-semibold tracking-[0.25em] text-[#0B1A33]">SILHO</p>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#C9A45C]">Medicina Estética</p>
        </div>
        <Button variant="outline" className="rounded-full border-[#0B1A33] text-[#0B1A33]">Agenda tu valoración</Button>
      </header>
      <section className="relative flex flex-1 items-center overflow-hidden bg-[#0B1A33] px-6 py-24 text-white lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(201,164,92,0.2),transparent_35%)]" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#E5CF95]/40 px-4 py-2 text-sm text-[#E5CF95]">
              <Sparkles className="size-4" /> Atención médica personalizada
            </div>
            <h1 className="font-heading text-5xl leading-[1.05] tracking-tight md:text-7xl">Medicina estética diseñada alrededor de ti.</h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-white/70">Tratamientos faciales, capilares y de rejuvenecimiento con valoración médica personalizada.</p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button className="rounded-full bg-[#C9A45C] px-7 text-[#0A0A0A] hover:bg-[#E5CF95]">Agenda tu valoración <ArrowRight /></Button>
              <Button variant="outline" className="rounded-full border-white/30 bg-transparent px-7 text-white hover:bg-white/10">Ver tratamientos</Button>
            </div>
            <p className="mt-10 text-sm text-[#E5CF95]">10% de descuento por pronto pago en procedimientos elegibles.</p>
            <p className="mt-2 max-w-lg text-xs leading-5 text-white/50">El descuento se aplica únicamente a procedimientos elegibles y no necesariamente a cirugías, paquetes, medicamentos o tratamientos especiales.</p>
          </div>
          <div className="hidden min-h-[420px] rounded-[2rem] border border-white/10 bg-white/[0.04] lg:block" />
        </div>
      </section>
    </main>
  );
}
