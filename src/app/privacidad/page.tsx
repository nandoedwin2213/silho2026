import { SectionHeading } from "@/components/site/section-heading";

export const metadata = { title: "Política de privacidad | SILHO" };

export default function PrivacyPage() {
  return <main className="mx-auto max-w-3xl px-6 py-16 lg:px-10 lg:py-24"><SectionHeading eyebrow="Privacidad" title="Política de privacidad" description="Texto preliminar sujeto a revisión legal especializada en Ecuador." /><div className="mt-10 space-y-6 text-sm leading-7 text-muted-foreground"><p>SILHO recopila los datos necesarios para responder solicitudes, coordinar valoraciones y prestar sus servicios. Tratamos la información conforme a la Ley Orgánica de Protección de Datos Personales (LOPDP) de Ecuador.</p><h2 className="font-heading text-2xl text-navy">Uso de la información</h2><p>Usaremos tus datos para gestionar contacto, agenda, pagos y comunicaciones relacionadas con tu solicitud. No vendemos datos personales.</p><h2 className="font-heading text-2xl text-navy">Tus derechos</h2><p>Puedes solicitar acceso, rectificación, actualización, eliminación u oposición al tratamiento, sujeto a las obligaciones legales aplicables, escribiendo a contacto@silho.ec.</p><p className="rounded-2xl bg-[#f5f1e8] p-5 text-navy">Este texto es un placeholder y debe ser revisado y aprobado por un abogado antes de producción.</p></div></main>;
}
