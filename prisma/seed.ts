import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

type ServiceSeed = {
  name: string;
  slug: string;
  category: string;
  price: number;
  description?: string;
  shortDescription?: string;
  priceFrom?: boolean;
  showPrice?: boolean;
  discountEligible?: boolean;
  requiresMedicalAssessment?: boolean;
  requiresManualQuote?: boolean;
  isSurgical?: boolean;
  featured?: boolean;
  concerns?: string[];
};

const categorySeeds = [
  ["Valoración", "valoracion", "Valoraciones médicas para orientar tu plan estético.", "/images/cat-valoracion.jpg"],
  ["Toxina botulínica", "toxina-botulinica", "Opciones de toxina botulínica según valoración médica.", "/images/cat-toxina-botulinica.jpg"],
  ["Ácido hialurónico", "acido-hialuronico", "Tratamientos con ácido hialurónico para armonización facial.", "/images/cat-acido-hialuronico.jpg"],
  ["Acné", "acne", "Opciones para conversar durante tu valoración de acné.", "/images/cat-acne.jpg"],
  ["Cicatrices de acné", "cicatrices-acne", "Tratamientos orientados a atenuar cicatrices y estimular remodelación.", "/images/cat-cicatrices-acne.jpg"],
  ["Rejuvenecimiento facial", "rejuvenecimiento-facial", "Alternativas de rejuvenecimiento facial personalizado.", "/images/cat-rejuvenecimiento-facial.jpg"],
  ["Medicina capilar", "medicina-capilar", "Valoración y seguimiento de salud capilar.", "/images/cat-medicina-capilar.jpg"],
  ["Trasplante capilar", "trasplante-capilar", "Procedimientos capilares que requieren valoración médica previa.", "/images/cat-trasplante-capilar.jpg"],
  ["Blefaroplastia", "blefaroplastia", "Procedimientos perioculares sujetos a valoración médica.", "/images/cat-blefaroplastia.jpg"],
  ["Rinoplastia", "rinoplastia", "Opciones nasales sujetas a valoración médica.", "/images/cat-rinoplastia.jpg"],
  ["Perfilamiento y armonización facial", "perfilamiento-facial", "Planes de armonización que comienzan con valoración.", "/images/cat-perfilamiento-facial.jpg"],
  ["Otros procedimientos", "otros-procedimientos", "Catálogo administrable de opciones estéticas.", "/images/cat-otros-procedimientos.jpg"],
] as const;

const simple = (category: string, names: string[], price: number): ServiceSeed[] =>
  names.map((name) => ({
    name,
    slug: `${category}-${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    category,
    price,
    shortDescription: "Opción para conversar durante tu valoración médica.",
    description: "La indicación, técnica y combinación se determinan de forma personalizada durante la valoración médica.",
  }));

const services: ServiceSeed[] = [
  ...simple("valoracion", ["Valoración estética facial", "Valoración capilar", "Valoración de acné", "Valoración de cicatrices", "Plan facial integral", "Valoración preprocedimiento"], 40),
  ...simple("toxina-botulinica", ["Frente", "Entrecejo", "Patas de gallo", "Bunny lines", "Sonrisa gingival", "Elevación de ceja", "Mentón empedrado", "Bandas platismales", "Maseteros", "Bruxismo", "Afinamiento facial", "Tercio superior", "Full Face Botox", "Botox preventivo", "Botox masculino"], 130),
  ...simple("acido-hialuronico", ["Labios", "Aumento de labios", "Pómulos", "Mentón", "Mandíbula", "Ojeras", "Surcos nasogenianos", "Perfilamiento nasal", "Full Face con ácido hialurónico"], 280),
  ...simple("acne", ["Consulta de acné", "Limpieza facial profunda", "Peeling químico", "Peeling de fenol superficial", "Dermapen", "Microneedling", "PRP", "Láser CO2 fraccionado", "Tratamiento de manchas postinflamatorias", "Tratamiento de poros", "Control de piel grasa", "Tratamiento combinado de acné", "Seguimiento mensual", "Programa SILHO Acné - 1 mes", "Programa SILHO Acné - 3 meses", "Programa SILHO Acné - 6 meses"], 120),
  ...simple("cicatrices-acne", ["Evaluación de cicatrices", "Subcisión", "Láser CO2 fraccionado", "Microneedling", "PRP", "Peeling químico", "TCA CROSS", "Bioestimulación", "Ácido hialurónico para cicatrices seleccionadas", "Terapia combinada", "Programa avanzado de cicatrices"], 180),
  ...simple("rejuvenecimiento-facial", ["Botox", "Ácido hialurónico", "Bioestimuladores", "PRP", "PDRN", "Skinboosters", "Profhilo", "Ácido poliláctico", "Hidroxiapatita de calcio", "Hilos tensores", "Láser CO2", "Radiofrecuencia", "Radiofrecuencia fraccionada", "HIFU", "Microneedling", "Dermapen", "Peelings", "Tratamiento de ojeras", "Full Face", "Neck rejuvenation", "Décolleté rejuvenation"], 220),
  ...simple("medicina-capilar", ["Valoración capilar", "Diagnóstico de alopecia", "PRP capilar", "Microneedling capilar", "Mesoterapia capilar", "Plan anticaída", "Tratamiento de alopecia", "Seguimiento fotográfico", "Tricoscopía", "Programa de recuperación capilar"], 160),
  ...simple("trasplante-capilar", ["FUE", "Microinjerto capilar", "Diseño de línea frontal", "Restauración de entradas", "Coronilla", "Barba", "Cejas"], 999).map((service) => ({ ...service, requiresMedicalAssessment: true, requiresManualQuote: true, isSurgical: true, discountEligible: false, description: "El valor depende del número de unidades foliculares, área, técnica y planificación médica." })),
  ...simple("blefaroplastia", ["Blefaroplastia superior", "Blefaroplastia inferior", "Superior + inferior", "Evaluación periocular"], 650).map((service) => ({ ...service, requiresMedicalAssessment: true, requiresManualQuote: true, isSurgical: true, discountEligible: false })),
  ...simple("rinoplastia", ["Valoración de nariz", "Rinoplastia estética", "Rinoplastia funcional", "Rinoplastia estética + funcional", "Rinoplastia secundaria", "Rinomodelación no quirúrgica"], 1200).map((service) => ({
    ...service,
    requiresMedicalAssessment: true,
    requiresManualQuote: service.name !== "Rinomodelación no quirúrgica" && service.name !== "Valoración de nariz",
    isSurgical: service.name !== "Rinomodelación no quirúrgica" && service.name !== "Valoración de nariz",
    discountEligible: service.name === "Rinomodelación no quirúrgica",
    showPrice: service.name === "Rinomodelación no quirúrgica" || service.name === "Valoración de nariz",
  })),
  ...simple("perfilamiento-facial", ["Perfilamiento mandibular", "Perfil mandibular", "Jawline", "Mentón", "Labios", "Pómulos", "Nariz", "Ojeras", "Surcos", "Tercio medio", "Tercio inferior", "Full Face", "Masculinización", "Feminización", "Perfiloplastia no quirúrgica", "ESSENTIAL", "ADVANCED", "FULL FACE"], 350).map((service) => ({ ...service, requiresMedicalAssessment: true, requiresManualQuote: service.name === "ESSENTIAL" || service.name === "ADVANCED" || service.name === "FULL FACE" })),
  ...simple("otros-procedimientos", ["Manchas", "Melasma", "Fotoenvejecimiento", "Rosácea", "Textura de piel", "Poros", "Arrugas", "Flacidez", "Cuello", "Papada", "Rejuvenecimiento de manos", "Cicatrices", "Estrías", "Eliminación de lesiones estéticas", "Hidratación facial", "Skin quality", "Protocolos de glow facial"], 150),
];

const isFeatured = (service: ServiceSeed) =>
  service.name === "Full Face Botox" ||
  (service.category === "acido-hialuronico" && service.name === "Labios") ||
  (service.category === "rinoplastia" && service.name === "Rinomodelación no quirúrgica") ||
  (service.category === "perfilamiento-facial" && service.name === "Perfilamiento mandibular") ||
  (service.category === "medicina-capilar" && service.name === "PRP capilar") ||
  (service.category === "acne" && service.name === "Láser CO2 fraccionado") ||
  (service.category === "valoracion" && service.name === "Valoración estética facial") ||
  (service.category === "acne" && service.name === "Programa SILHO Acné - 3 meses");

const concernSeeds = ["Acné", "Cicatrices", "Arrugas", "Labios", "Nariz", "Mandíbula", "Mentón", "Ojeras", "Manchas", "Flacidez", "Cabello", "Poros", "Textura", "Rejuvenecimiento"];

const slugify = (value: string) =>
  value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const hasName = (service: ServiceSeed, names: string[]) => names.includes(service.name);
const concernRules: Record<string, (service: ServiceSeed) => boolean> = {
  Acné: (service) => service.category === "acne",
  Cicatrices: (service) => service.category === "cicatrices-acne" || hasName(service, ["Cicatrices", "TCA CROSS", "Subcisión"]),
  Arrugas: (service) =>
    (service.category === "toxina-botulinica" && hasName(service, ["Tercio superior", "Full Face Botox", "Frente", "Entrecejo", "Patas de gallo"])) ||
    (service.category === "rejuvenecimiento-facial" && hasName(service, ["Skinboosters", "Bioestimuladores", "HIFU"])),
  Labios: (service) => hasName(service, ["Labios"]) || (service.category === "acido-hialuronico" && service.name.toLowerCase().includes("labio")),
  Nariz: (service) => service.category === "rinoplastia" || hasName(service, ["Perfilamiento nasal", "Nariz"]),
  Mandíbula: (service) => hasName(service, ["Mandíbula", "Perfilamiento mandibular", "Perfil mandibular", "Jawline", "Maseteros"]),
  Mentón: (service) => hasName(service, ["Mentón", "Mentón empedrado"]),
  Ojeras: (service) => hasName(service, ["Ojeras", "Tratamiento de ojeras"]),
  Manchas: (service) => hasName(service, ["Manchas", "Melasma", "Tratamiento de manchas postinflamatorias"]),
  Flacidez: (service) => hasName(service, ["Flacidez", "Hilos tensores", "HIFU", "Radiofrecuencia"]),
  Cabello: (service) => service.category === "medicina-capilar" || service.category === "trasplante-capilar",
  Poros: (service) => hasName(service, ["Poros", "Tratamiento de poros", "Control de piel grasa"]),
  Textura: (service) => hasName(service, ["Textura de piel", "Microneedling", "Dermapen", "Radiofrecuencia fraccionada"]),
  Rejuvenecimiento: (service) => service.category === "rejuvenecimiento-facial" || hasName(service, ["Bioestimuladores", "PRP", "HIFU"]),
};

const blogSeeds = [
  {
    category: "Acné",
    title: "Guía SILHO: Acné",
    excerpt: "Una mirada general a los factores que se conversan al valorar el acné y las alternativas disponibles para cuidar la piel.",
    coverImage: "/images/blog-acne.jpg",
    publishedAt: new Date("2026-01-07T12:00:00.000Z"),
    content: `## ¿Qué es?

El acné es una condición frecuente de la piel que puede presentarse en distintas etapas de la vida. Puede incluir puntos negros, puntos blancos, pápulas, pústulas o lesiones más profundas. Su expresión cambia entre personas y también puede verse influida por hormonas, productos cosméticos, medicamentos, estrés y hábitos cotidianos. Observar el tipo de lesiones, su distribución y el tiempo de evolución ayuda a orientar una conversación médica.

## ¿Para quién puede ser una opción?

Una valoración puede ser útil para quienes desean entender mejor los brotes, revisar una rutina o conversar sobre alternativas médicas y de cuidado en casa. También puede ser un espacio para abordar manchas posteriores, sensibilidad o marcas. No existe una fórmula universal: la edad, los antecedentes, los productos utilizados y la respuesta previa forman parte de la historia clínica.

## Qué esperar de la valoración

Durante la cita se revisan objetivos, antecedentes y características visibles de la piel. El profesional puede explicar opciones como limpieza, peelings, microneedling, láser u otras alternativas cuando correspondan. La indicación se plantea de manera gradual y puede requerir seguimiento para observar la evolución y ajustar el plan.

## Cuidados generales

La limpieza suave, la hidratación adecuada y la fotoprotección suelen formar parte de una conversación de cuidado general. Evita manipular las lesiones y consulta antes de combinar activos o procedimientos. Lleva a la valoración una lista de productos y medicamentos relevantes. Registrar cuándo aparecen los brotes, qué zonas se repiten y cómo responde la piel a los productos puede hacer más útil la conversación. La indicación depende de una valoración médica individual.`,
  },
  {
    category: "Rejuvenecimiento",
    title: "Guía SILHO: Rejuvenecimiento",
    excerpt: "Conoce cómo se conversa sobre calidad de piel, textura y signos visibles del paso del tiempo durante una valoración.",
    coverImage: "/images/blog-rejuvenecimiento.jpg",
    publishedAt: new Date("2026-01-14T12:00:00.000Z"),
    content: `## ¿Qué es?

El rejuvenecimiento facial reúne distintas alternativas orientadas a acompañar cambios de textura, hidratación, tono y firmeza de la piel. No describe un único procedimiento ni un resultado predeterminado. Puede incluir hábitos de cuidado, tecnologías y tratamientos médicos, siempre seleccionados según la piel y los objetivos de cada persona.

## ¿Para quién puede ser una opción?

Puede interesar a quienes desean conversar sobre una rutina, mejorar la apariencia de la piel o comprender qué opciones existen para distintas zonas del rostro y cuello. Algunas personas buscan atender textura; otras quieren revisar hidratación o signos de fotoexposición. La valoración permite distinguir expectativas, antecedentes y prioridades antes de considerar cualquier alternativa.

## Qué esperar de la valoración

El profesional conversa sobre historia clínica, sensibilidad, exposición solar y procedimientos previos. También observa la piel y explica qué opciones pueden tener sentido, como bioestimuladores, PRP, skinboosters, radiofrecuencia, HIFU, peelings u otras. El plan puede ser escalonado y requiere comprender indicaciones, cuidados y controles.

## Cuidados generales

La fotoprotección diaria, la limpieza sin fricción y una hidratación compatible con tu piel son bases frecuentes. No combines productos irritantes ni suspendas medicamentos sin orientación. Comunica alergias, embarazo, lactancia o procedimientos recientes antes de una cita. También es útil anotar qué cambios te preocupan y qué productos has probado, sin suspender tratamientos indicados por otro profesional. La indicación depende de una valoración médica individual.`,
  },
  {
    category: "Ácido hialurónico",
    title: "Guía SILHO: Ácido hialurónico",
    excerpt: "Información general para conversar sobre ácido hialurónico, objetivos estéticos y la importancia de una indicación individual.",
    coverImage: "/images/blog-acido-hialuronico.jpg",
    publishedAt: new Date("2026-01-21T12:00:00.000Z"),
    content: `## ¿Qué es?

El ácido hialurónico es una sustancia utilizada en distintos contextos médicos y estéticos. En tratamientos faciales puede conversar sobre hidratación, soporte, proporción o armonización de determinadas zonas. Cada producto, técnica y área tiene características diferentes, por lo que el nombre general no permite anticipar qué se indicará ni cómo será un plan.

## ¿Para quién puede ser una opción?

Puede ser una alternativa para personas que desean revisar labios, pómulos, mentón, ojeras, surcos u otras áreas durante una consulta. También puede ser útil para quienes tienen dudas sobre productos previos o buscan una segunda conversación médica. Los antecedentes, la anatomía y las expectativas deben revisarse antes de definir si corresponde.

## Qué esperar de la valoración

La cita incluye una conversación sobre objetivos, antecedentes, alergias, medicamentos y procedimientos anteriores. El profesional explica opciones, límites, posibles efectos adversos y cuidados. La indicación puede ser no realizar el procedimiento, elegir otra alternativa o plantear un abordaje gradual. Las decisiones deben tomarse con información clara y espacio para preguntas.

## Cuidados generales

Comparte la información de cualquier procedimiento previo y evita ocultar medicamentos o condiciones relevantes. Sigue únicamente las instrucciones entregadas por el equipo tratante y consulta si aparece una reacción inesperada. No uses fotografías de referencia como una promesa de resultado. Una buena consulta también permite conversar sobre alternativas conservadoras, tiempos de revisión y las preguntas que necesitas resolver antes de decidir. La indicación depende de una valoración médica individual.`,
  },
  {
    category: "Botox",
    title: "Guía SILHO: Toxina botulínica",
    excerpt: "Una explicación general sobre las zonas que pueden conversarse y los factores que orientan una valoración de toxina botulínica.",
    coverImage: "/images/blog-botox.jpg",
    publishedAt: new Date("2026-01-28T12:00:00.000Z"),
    content: `## ¿Qué es?

La toxina botulínica es una herramienta médica que puede utilizarse en distintas zonas y situaciones, de acuerdo con una valoración. En estética facial, la conversación suele incluir movimiento muscular, expresión, proporciones y objetivos personales. No todas las líneas o zonas se abordan de la misma forma, y la técnica depende de la anatomía y del criterio clínico.

## ¿Para quién puede ser una opción?

Puede ser una alternativa para quienes desean conversar sobre frente, entrecejo, patas de gallo u otras áreas faciales. También existen usos que requieren una evaluación específica. La cita es importante para diferenciar objetivos estéticos, antecedentes neuromusculares, medicamentos y expectativas. No se recomienda elegir zonas de manera automática desde un catálogo.

## Qué esperar de la valoración

El profesional revisa gestos, simetrías, antecedentes y procedimientos previos. Explica qué puede plantearse, qué límites existen y qué cuidados son relevantes. La cantidad, técnica y áreas no deben definirse únicamente por una fotografía. En algunos casos puede recomendarse esperar, ajustar expectativas o considerar otra opción.

## Cuidados generales

Informa sobre medicamentos, alergias, embarazo, lactancia y tratamientos anteriores. Sigue las instrucciones posteriores del equipo médico y consulta cualquier síntoma que te preocupe. Evita comparar procesos individuales o asumir que una experiencia ajena se repetirá. Pregunta por la preparación, el seguimiento y las señales que deberían motivar una consulta, y toma la decisión con tiempo suficiente. La indicación depende de una valoración médica individual.`,
  },
  {
    category: "Capilar",
    title: "Guía SILHO: Medicina capilar",
    excerpt: "Aspectos generales de una valoración capilar y de las conversaciones posibles sobre caída, cuero cabelludo y seguimiento.",
    coverImage: "/images/blog-capilar.jpg",
    publishedAt: new Date("2026-02-04T12:00:00.000Z"),
    content: `## ¿Qué es?

La medicina capilar reúne la valoración del cabello y del cuero cabelludo, el análisis de antecedentes y el seguimiento de cambios a lo largo del tiempo. La caída puede tener causas diversas y presentarse de forma temporal o persistente. Por eso conviene revisar la historia, los medicamentos, los hábitos y las características del cuero cabelludo antes de hablar de opciones.

## ¿Para quién puede ser una opción?

Puede ser útil para quienes observan caída, cambios de densidad, picazón, descamación o modificaciones en la línea frontal. También puede interesar a quienes desean revisar un plan anticaída o documentar su evolución. La tricoscopía, fotografías clínicas y otras herramientas pueden formar parte de la conversación si el profesional las considera pertinentes.

## Qué esperar de la valoración

La cita permite ordenar antecedentes, objetivos y tratamientos previos. El profesional puede conversar sobre PRP capilar, microneedling, mesoterapia, seguimiento fotográfico u otras alternativas, sin asumir que todas son adecuadas para cada persona. El plan puede incluir controles y ajustes según la evolución observada.

## Cuidados generales

Evita iniciar suplementos o medicamentos por cuenta propia. Comunica cambios recientes, antecedentes familiares y productos utilizados. Trata el cuero cabelludo con suavidad y consulta si aparecen lesiones, dolor o inflamación. Las fotografías comparables ayudan a observar cambios, pero no sustituyen una revisión clínica. Llevar una cronología de la caída y de los productos utilizados puede ayudar a ordenar la consulta y definir qué seguimiento sería razonable. La indicación depende de una valoración médica individual.`,
  },
  {
    category: "Cicatrices",
    title: "Guía SILHO: Cicatrices de acné",
    excerpt: "Información para entender los tipos de cicatrices de acné y las alternativas que pueden conversarse durante una valoración.",
    coverImage: "/images/blog-cicatrices.jpg",
    publishedAt: new Date("2026-02-11T12:00:00.000Z"),
    content: `## ¿Qué es?

Las cicatrices de acné son cambios persistentes que pueden variar en profundidad, color y textura. Entre las formas que suelen describirse están las ice pick, boxcar y rolling. También pueden coexistir manchas posteriores y brotes activos. Identificar cada componente ayuda a conversar sobre objetivos realistas y sobre el orden en que podrían abordarse.

## ¿Para quién puede ser una opción?

Una valoración puede servir a quienes desean mejorar o atenuar la apariencia de cicatrices, revisar tratamientos previos o entender por qué una zona tiene una textura distinta. La piel, la actividad del acné, la sensibilidad y los antecedentes influyen en las alternativas. No se promete eliminación completa ni una respuesta idéntica entre personas.

## Qué esperar de la valoración

El profesional revisa el tipo de cicatriz y puede conversar sobre subcisión, microneedling, láser CO2, peelings, bioestimulación, PRP u otras opciones. A veces se propone una combinación o una secuencia de sesiones. La indicación debe considerar recuperación, riesgos, cuidados y la posibilidad de ajustar el plan.

## Cuidados generales

La fotoprotección ayuda a cuidar el tono y debe acompañar cualquier conversación sobre procedimientos. No manipules lesiones activas ni combines exfoliantes sin orientación. Informa si tienes antecedentes de cicatrización particular o sensibilidad. Pregunta por la preparación, los intervalos entre sesiones y la forma de controlar la evolución, y evita tomar decisiones basadas solo en una imagen comparativa. La indicación depende de una valoración médica individual.`,
  },
  {
    category: "Láser",
    title: "Guía SILHO: Láser CO2",
    excerpt: "Una introducción general a la conversación médica sobre láser CO2, piel, recuperación y cuidados.",
    coverImage: "/images/blog-laser.jpg",
    publishedAt: new Date("2026-02-18T12:00:00.000Z"),
    content: `## ¿Qué es?

El láser CO2 es una tecnología que puede utilizarse en distintos protocolos de cuidado de la piel. La profundidad, energía, zona y objetivo cambian según la indicación. No todos los equipos ni todas las sesiones son equivalentes. Una valoración permite explicar qué se busca abordar y si la tecnología es compatible con las características de la piel.

## ¿Para quién puede ser una opción?

Puede conversarse para textura, cicatrices, fotoenvejecimiento u otras preocupaciones seleccionadas. La piel activa, ciertas condiciones, medicamentos y la exposición solar pueden modificar la recomendación. La decisión no debe basarse únicamente en fotografías de resultados ajenos ni en la idea de que una tecnología sirve para todos los casos.

## Qué esperar de la valoración

El profesional revisa antecedentes, sensibilidad, fototipo, tratamientos recientes y expectativas. Explica preparación, recuperación, cuidados y señales de alerta. Puede recomendar otra alternativa o posponer el procedimiento si existen factores que conviene controlar primero. La información debe incluir límites y posibles efectos adversos.

## Cuidados generales

La fotoprotección y el cumplimiento de las indicaciones posteriores son fundamentales. Evita exponerte al sol o aplicar productos no autorizados durante la recuperación. Comunica cambios en la piel y consulta si aparece una reacción que no esperabas. Antes de agendar, confirma qué productos debes suspender, cuánto seguimiento se contempla y qué cuidados son compatibles con tu rutina diaria. La indicación depende de una valoración médica individual.`,
  },
  {
    category: "Armonización facial",
    title: "Guía SILHO: Armonización facial",
    excerpt: "Cómo abordar una conversación de armonización facial desde objetivos personales, proporciones y una valoración médica.",
    coverImage: "/images/blog-armonizacion-facial.jpg",
    publishedAt: new Date("2026-02-25T12:00:00.000Z"),
    content: `## ¿Qué es?

La armonización facial describe un enfoque de conversación sobre proporciones, balance y características del rostro. No es un procedimiento único ni una recomendación automática. Puede incluir distintas zonas y herramientas, pero cada decisión requiere comprender la anatomía, los objetivos y los límites de una intervención. La naturalidad y la individualidad deben formar parte de la conversación.

## ¿Para quién puede ser una opción?

Puede interesar a quienes desean revisar perfil, labios, mentón, mandíbula, pómulos, nariz u otras áreas. Algunas personas buscan entender qué les gustaría cambiar; otras quieren revisar un tratamiento previo. La valoración ayuda a ordenar prioridades y a distinguir entre lo que es posible conversar, lo que requiere otra especialidad y lo que conviene no realizar.

## Qué esperar de la valoración

El profesional escucha tus objetivos, revisa antecedentes y observa proporciones y movimiento. Puede explicar opciones como ácido hialurónico, toxina botulínica u otras alternativas, junto con riesgos, cuidados y límites. No se deben recomendar paquetes de manera automática: el plan, si existe, se construye de forma individual.

## Cuidados generales

Lleva información de procedimientos previos y comunica alergias, medicamentos y condiciones relevantes. Usa referencias visuales solo para explicar una preferencia, no como promesa. Tómate el tiempo para preguntar y decidir. Lleva referencias que expliquen tus preferencias, pero permite que el criterio clínico guíe la conversación sobre proporciones, seguridad, alternativas y seguimiento. La indicación depende de una valoración médica individual.`,
  },
];

async function main() {
  for (const [order, [name, slug, description, image]] of categorySeeds.entries()) {
    await prisma.category.upsert({
      where: { slug },
      update: { name, description, image, order, active: true },
      create: { name, slug, description, image, order },
    });
  }

  const categoryMap = new Map((await prisma.category.findMany()).map((category) => [category.slug, category.id]));
  for (const [order, name] of concernSeeds.entries()) {
    await prisma.concern.upsert({
      where: { slug: slugify(name) },
      update: { name, order },
      create: { name, slug: slugify(name), order },
    });
  }
  const concernMap = new Map((await prisma.concern.findMany()).map((concern) => [concern.slug, concern.id]));

  for (const service of services) {
    const categoryId = categoryMap.get(service.category);
    if (!categoryId) throw new Error(`Categoría no encontrada: ${service.category}`);
    const record = await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        name: service.name,
        categoryId,
        description: service.description ?? "Tratamiento estético personalizado.",
        shortDescription: service.shortDescription ?? "Opción para conversar durante tu valoración médica.",
        basePrice: service.price,
        priceFrom: service.priceFrom ?? true,
        showPrice: service.showPrice ?? true,
        discountEligible: service.discountEligible ?? true,
        requiresMedicalAssessment: service.requiresMedicalAssessment ?? false,
        requiresManualQuote: service.requiresManualQuote ?? false,
        isSurgical: service.isSurgical ?? false,
        featured: isFeatured(service),
        active: true,
      },
      create: {
        name: service.name,
        slug: service.slug,
        categoryId,
        description: service.description ?? "Tratamiento estético personalizado.",
        shortDescription: service.shortDescription ?? "Opción para conversar durante tu valoración médica.",
        basePrice: service.price,
        priceFrom: service.priceFrom ?? true,
        showPrice: service.showPrice ?? true,
        discountEligible: service.discountEligible ?? true,
        requiresMedicalAssessment: service.requiresMedicalAssessment ?? false,
        requiresManualQuote: service.requiresManualQuote ?? false,
        isSurgical: service.isSurgical ?? false,
        featured: isFeatured(service),
      },
    });
    const relatedConcerns = [...new Set([...(service.concerns ?? []), ...concernSeeds.filter((concern) => concernRules[concern]?.(service) || service.name.toLowerCase().includes(concern.toLowerCase()))])];
    await prisma.serviceConcern.deleteMany({ where: { serviceId: record.id } });
    for (const concern of relatedConcerns) {
      const concernId = concernMap.get(slugify(concern));
      if (concernId) await prisma.serviceConcern.upsert({
        where: { serviceId_concernId: { serviceId: record.id, concernId } },
        update: {},
        create: { serviceId: record.id, concernId },
      });
    }
  }

  const settings = {
    PRONTO_PAGO_DISCOUNT: "10",
    WHATSAPP_NUMBER: "593999999999",
    INSTAGRAM_URL: "https://instagram.com/silho.ec",
    TIKTOK_URL: "https://tiktok.com/@silho.ec",
    FACEBOOK_URL: "https://facebook.com/silho.ec",
    SHOW_SURGICAL_PRICES: "false",
    CLINIC_EMAIL: "contacto@silho.ec",
    BANK_TRANSFER_INSTRUCTIONS: "Transferencia bancaria: información de cuenta por confirmar. Te contactaremos para compartir los datos y validar tu pago.",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }

  for (const [order, name] of ["Quito", "Guayaquil", "Salinas"].entries()) {
    await prisma.location.upsert({
      where: { id: `location-${slugify(name)}` },
      update: { name, city: name, address: "Dirección por configurar", order, active: true },
      create: { id: `location-${slugify(name)}`, name, city: name, address: "Dirección por configurar", order },
    });
  }
  await prisma.professional.upsert({
    where: { id: "professional-edwin-ayala" },
    update: { name: "Dr. Edwin Ayala", title: "Médico", bio: "Atención médica orientada a tratamientos estéticos personalizados, armonización facial, rejuvenecimiento y salud estética.", active: true },
    create: {
      id: "professional-edwin-ayala",
      name: "Dr. Edwin Ayala",
      title: "Médico",
      bio: "Atención médica orientada a tratamientos estéticos personalizados, armonización facial, rejuvenecimiento y salud estética.",
      education: [],
      experience: [],
      certifications: [],
      publications: [],
      procedures: [],
      socials: [],
    },
  });

  const plans: Array<[string, string, number]> = [
    ["SILHO ESSENTIAL", "essential", 49],
    ["SILHO PLUS", "plus", 75],
    ["SILHO PREMIUM", "premium", 120],
  ];
  for (const [order, [name, slug, price]] of plans.entries()) {
    await prisma.subscriptionPlan.upsert({ where: { slug }, update: { name, price, order, active: true, interval: "MONTH" }, create: { name, slug, price, order, interval: "MONTH" } });
  }

  for (const post of blogSeeds) {
    const slug = slugify(post.category);
    const closing = "La indicación depende de una valoración médica individual.";
    const closingIndex = post.content.lastIndexOf(closing);
    const content = `${post.content.slice(0, closingIndex)}La consulta también permite ordenar prioridades, resolver dudas sobre preparación y seguimiento, conocer límites del plan y decidir qué información llevar al equipo médico antes de tomar una decisión. ${closing}`;
    await prisma.blogPost.upsert({
      where: { slug: `guia-${slug}` },
      update: { title: post.title, excerpt: post.excerpt, content, category: post.category, coverImage: post.coverImage, published: true, publishedAt: post.publishedAt },
      create: { slug: `guia-${slug}`, title: post.title, excerpt: post.excerpt, content, category: post.category, coverImage: post.coverImage, published: true, publishedAt: post.publishedAt },
    });
  }

  const email = process.env.ADMIN_EMAIL ?? "admin@silho.ec";
  const password = process.env.ADMIN_PASSWORD ?? "change-me-please";
  await prisma.adminUser.upsert({
    where: { email },
    update: { name: "Administrador SILHO", passwordHash: await bcrypt.hash(password, 12), role: "ADMIN" },
    create: { email, name: "Administrador SILHO", passwordHash: await bcrypt.hash(password, 12), role: "ADMIN" },
  });

  console.log(JSON.stringify({
    categories: await prisma.category.count(),
    concerns: await prisma.concern.count(),
    services: await prisma.service.count(),
    serviceConcerns: await prisma.serviceConcern.count(),
    locations: await prisma.location.count(),
    professionals: await prisma.professional.count(),
    plans: await prisma.subscriptionPlan.count(),
    blogPosts: await prisma.blogPost.count(),
    adminUsers: await prisma.adminUser.count(),
    servicesPerConcern: Object.fromEntries((await prisma.concern.findMany({ orderBy: { order: "asc" }, include: { services: true } })).map((concern) => [concern.name, concern.services.length])),
  }, null, 2));
}

main().finally(() => prisma.$disconnect());
