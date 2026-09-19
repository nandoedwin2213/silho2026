import { SectionHeading } from "@/components/site/section-heading";

export const metadata = { title: "Términos y condiciones | SILHO" };

export default function TermsPage() {
  return <main className="mx-auto max-w-3xl px-6 py-16 lg:px-10 lg:py-24"><SectionHeading eyebrow="Legal" title="Términos y condiciones" description="Texto preliminar sujeto a revisión legal especializada en Ecuador." /><div className="mt-10 space-y-6 text-sm leading-7 text-muted-foreground"><p>El uso de este sitio permite solicitar información, valoraciones y servicios de SILHO. La información publicada es general y no reemplaza una consulta médica.</p><p>Los precios publicados son comerciales, configurables y pueden depender de valoración, técnica, insumos o planificación. Las cirugías y procedimientos sujetos a valoración no pueden comprarse directamente.</p><p>Los resultados varían entre pacientes y no se prometen resultados. Los pagos se procesan mediante proveedores autorizados y SILHO no almacena datos de tarjetas.</p><p className="rounded-2xl bg-[#f5f1e8] p-5 text-navy">Este texto es un placeholder y debe ser revisado y aprobado por un abogado antes de producción.</p></div></main>;
}
