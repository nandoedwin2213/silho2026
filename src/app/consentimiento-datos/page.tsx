import { SectionHeading } from "@/components/site/section-heading";

export const metadata = { title: "Consentimiento de datos | SILHO" };

export default function ConsentPage() {
  return <main className="mx-auto max-w-3xl px-6 py-16 lg:px-10 lg:py-24"><SectionHeading eyebrow="Datos personales" title="Consentimiento para el tratamiento de datos" description="Texto preliminar sujeto a revisión legal especializada en Ecuador." /><div className="mt-10 space-y-6 text-sm leading-7 text-muted-foreground"><p>Al enviar un formulario, autorizas a SILHO a tratar los datos proporcionados para gestionar tu solicitud de información, valoración, agenda o pago, conforme a la política de privacidad y la LOPDP.</p><p>Puedes retirar tu consentimiento o ejercer tus derechos escribiendo a contacto@silho.ec. El retiro no afecta tratamientos realizados antes de la solicitud.</p><p className="rounded-2xl bg-[#f5f1e8] p-5 text-navy">Este texto es un placeholder y debe ser revisado y aprobado por un abogado antes de producción.</p></div></main>;
}
