export type RouteSlug = "rejuvenecimiento-facial" | "acne" | "cicatrices-acne";

export type FacialRoute = {
  slug: RouteSlug;
  name: string;
  navLabel: string;
  eyebrow: string;
  headline: string;
  tagline: string;
  problem: string;
  consequences: string;
  solution: string;
  assessment: string;
  treatments: { name: string; text: string }[];
  benefits: string[];
  faq: [string, string][];
  priceFrom: number;
  priceNote: string;
  categorySlugs: string[];
  image: string;
  keywords: string[];
};

const priceNote = "Valor referencial. El valor final depende de la valoración, productos, técnicas, número de sesiones y complejidad del caso.";

export const routes: Record<RouteSlug, FacialRoute> = {
  "rejuvenecimiento-facial": {
    slug: "rejuvenecimiento-facial",
    name: "Rejuvenecimiento y armonización facial",
    navLabel: "Rejuvenecimiento facial",
    eyebrow: "Ruta SILHO · Rejuvenecimiento facial",
    headline: "Rejuvenecer no significa cambiar su rostro.",
    tagline: "Diseñamos tratamientos faciales que respetan su identidad.",
    problem: "El rostro cambia con el tiempo, la expresión, la exposición solar y otros factores. A veces no es claro qué necesita realmente ni por dónde empezar.",
    consequences: "Elegir productos o procedimientos sin un plan puede dispersar sus objetivos y no considerar las proporciones, la anatomía o la salud de su piel.",
    solution: "Evaluamos el rostro completo para conversar sobre naturalidad, proporciones y un plan individual, paso a paso.",
    assessment: "Durante la valoración revisamos sus objetivos, antecedentes, movimientos, proporciones, piel y tratamientos previos. Juntos definimos qué tiene sentido conversar y qué no.",
    treatments: [
      { name: "Toxina botulínica", text: "Para conversar sobre líneas de expresión y movimiento facial según su anatomía." },
      { name: "Ácido hialurónico", text: "Alternativas para soporte, hidratación o armonización de zonas seleccionadas." },
      { name: "Perfilamiento nasal sin cirugía", text: "Una opción que sólo se indica después de valorar proporciones y seguridad." },
      { name: "Labios", text: "Definición, hidratación o armonización sin fórmulas automáticas." },
      { name: "Pómulos y equilibrio facial", text: "Conversación sobre balance y proporciones del rostro." },
      { name: "Perfilamiento y equilibrio facial", text: "Un plan para revisar proporciones y balance de manera individual." },
      { name: "Líneas de expresión", text: "Valoración del movimiento y las líneas visibles del rostro." },
      { name: "Rejuvenecimiento facial integral", text: "Plan combinado y gradual cuando sea clínicamente apropiado." },
      { name: "Full Face personalizado", text: "Evaluación del rostro completo y priorización de objetivos." },
    ],
    benefits: [
      "Comprender qué necesita realmente su rostro.",
      "Priorizar objetivos con un plan individual.",
      "Conversar sobre alternativas y sus límites.",
      "Mantener una apariencia coherente con su identidad.",
      "Contar con seguimiento posterior según indicación.",
    ],
    faq: [
      ["¿Qué incluye la valoración facial?", "Incluye una conversación sobre objetivos, antecedentes, tratamientos previos y una evaluación médica del rostro para orientar las alternativas."],
      ["¿Necesito saber qué procedimiento quiero?", "No. Puede llegar con una inquietud o un objetivo; la valoración ayuda a ordenar opciones y prioridades."],
      ["¿Un plan Full Face significa cambiar todo el rostro?", "No. Es una forma de evaluar el rostro completo para priorizar lo que podría tener sentido, sin asumir que todo debe tratarse."],
      ["¿Se puede mantener un resultado natural?", "La naturalidad y sus preferencias forman parte de la conversación, junto con las posibilidades y límites clínicos."],
      ["¿Cuánto cuesta un plan facial?", "El valor final depende de productos, técnicas, sesiones y complejidad. El valor publicado es referencial."],
      ["¿Puedo combinar tratamientos?", "Sólo cuando la valoración determine que la combinación es apropiada y segura para su caso."],
    ],
    priceFrom: 850,
    priceNote,
    categorySlugs: ["toxina-botulinica", "acido-hialuronico", "perfilamiento-facial", "rejuvenecimiento-facial"],
    image: "/images/cat-rejuvenecimiento-facial.jpg",
    keywords: ["rejuvenecimiento facial", "armonización facial", "Full Face", "medicina estética facial", "tratamientos faciales", "valoración facial"],
  },
  acne: {
    slug: "acne",
    name: "Tratamiento médico del acné",
    navLabel: "Acné",
    eyebrow: "Ruta SILHO · Acné",
    headline: "Tratamos el acné activo antes de que deje nuevas cicatrices.",
    tagline: "Un plan médico para entender su piel y acompañar su evolución.",
    problem: "El acné puede aparecer como brotes, inflamación, lesiones profundas, grasa, manchas o sensibilidad. Cada piel necesita una lectura diferente.",
    consequences: "Dejar lesiones activas sin una estrategia puede favorecer nuevas marcas, manipulación de la piel y cambios persistentes de textura o tono.",
    solution: "Valoramos el tipo de lesiones, sus antecedentes y su rutina para construir un plan gradual de control y seguimiento.",
    assessment: "Revisamos la historia del acné, productos, medicamentos, hábitos, sensibilidad y objetivos. La indicación puede incluir cuidado en casa, procedimientos o derivación cuando corresponda.",
    treatments: [
      { name: "Limpieza facial médica", text: "Higiene profesional orientada a las necesidades de su piel." },
      { name: "Peelings químicos", text: "Alternativas que se consideran según el estado y sensibilidad de la piel." },
      { name: "Control de grasa e inflamación", text: "Conversación sobre hábitos, productos y opciones médicas." },
      { name: "Manchas postacné", text: "Plan para diferenciar manchas, lesiones activas y cicatrices." },
      { name: "Terapias regenerativas", text: "Opciones seleccionadas sólo cuando están indicadas." },
      { name: "Láser y tecnología facial", text: "Tecnologías que se valoran según diagnóstico y momento clínico." },
      { name: "Planes combinados y seguimiento", text: "Controles para observar evolución y ajustar el plan." },
    ],
    benefits: [
      "Entender qué tipo de acné presenta.",
      "Priorizar el control de lesiones activas.",
      "Recibir indicaciones de cuidado más claras.",
      "Prevenir nuevas marcas dentro de un plan médico.",
      "Dar seguimiento a la evolución de su piel.",
    ],
    faq: [
      ["¿Debo esperar a que desaparezca el acné para consultar?", "No. La valoración puede ayudar a controlar el acné activo y a evitar que se sigan acumulando lesiones."],
      ["¿El acné sólo se trata con productos?", "Depende de la historia y el tipo de lesiones. La valoración permite conversar sobre cuidados, procedimientos y otras opciones médicas."],
      ["¿Cuánto dura un plan para acné?", "El tiempo depende de la respuesta de la piel, la constancia y la complejidad del caso. Se revisa durante los controles."],
      ["¿Puedo tratar manchas y acné al mismo tiempo?", "Primero se determina qué está activo y qué necesita prioridad; el plan puede cambiar por etapas."],
      ["¿Qué debo llevar a la valoración?", "Una lista de productos, medicamentos y tratamientos previos puede ayudar a ordenar la conversación."],
      ["¿El acné puede volver?", "Puede tener periodos de actividad. El seguimiento permite ajustar el plan cuando cambian las condiciones de la piel."],
    ],
    priceFrom: 500,
    priceNote,
    categorySlugs: ["acne"],
    image: "/images/cat-acne.jpg",
    keywords: ["tratamiento del acné", "acné activo", "medicina estética facial", "acné Ecuador", "control del acné", "valoración de acné"],
  },
  "cicatrices-acne": {
    slug: "cicatrices-acne",
    name: "Tratamiento de cicatrices de acné",
    navLabel: "Cicatrices de acné",
    eyebrow: "Ruta SILHO · Cicatrices de acné",
    headline: "Cada cicatriz requiere una estrategia diferente.",
    tagline: "Entendemos su textura, profundidad y contexto antes de proponer un plan.",
    problem: "Las cicatrices pueden ser ice pick, boxcar, rolling o una combinación. También pueden coexistir manchas y acné activo.",
    consequences: "Tratar todas las cicatrices como si fueran iguales puede llevar a elegir una técnica que no corresponde a su profundidad, textura o momento clínico.",
    solution: "Clasificamos las características visibles y conversamos sobre una secuencia de técnicas, sesiones y cuidados realistas.",
    assessment: "Evaluamos el tipo de cicatriz, actividad del acné, sensibilidad, antecedentes y procedimientos previos. El protocolo se define después de esta valoración.",
    treatments: [
      { name: "Láser fraccionado", text: "Tecnología que puede conversarse para textura y cicatrices seleccionadas." },
      { name: "Peelings médicos", text: "Alternativas de profundidad y tipo que se definen individualmente." },
      { name: "Peeling de fenol", text: "Sólo cuando esté correctamente indicado y con la preparación correspondiente." },
      { name: "Subcisión", text: "Técnica que puede considerarse para determinadas adherencias." },
      { name: "Microneedling o Dermapen", text: "Opciones que se valoran según textura, piel y objetivos." },
      { name: "Plasma rico en plaquetas", text: "Alternativa regenerativa que requiere indicación médica." },
      { name: "Técnicas regenerativas", text: "Opciones que pueden formar parte de un protocolo combinado." },
      { name: "Protocolos combinados", text: "Secuencias por sesiones para abordar diferentes componentes." },
    ],
    benefits: [
      "Distinguir los tipos de cicatrices presentes.",
      "Ordenar qué problema debe atenderse primero.",
      "Conversar sobre técnicas, sesiones y recuperación.",
      "Definir expectativas más realistas para su piel.",
      "Revisar la evolución y ajustar el protocolo.",
    ],
    faq: [
      ["¿Las cicatrices pueden eliminarse por completo?", "No se promete eliminación completa. El objetivo se conversa según el tipo de cicatriz y las posibilidades de su piel."],
      ["¿Qué significa ice pick, boxcar o rolling?", "Son descripciones de formas y profundidades distintas. Identificarlas ayuda a orientar la técnica que podría conversarse."],
      ["¿Se puede tratar una cicatriz reciente?", "Depende de su estado, la actividad del acné y la maduración de la piel. La valoración define el momento."],
      ["¿Cuántas sesiones necesitaré?", "No existe un número universal. Depende del tipo de cicatriz, las técnicas y la respuesta observada."],
      ["¿El láser es la única opción?", "No. Pueden considerarse peelings, subcisión, microneedling, PRP u otras opciones según el caso."],
      ["¿Qué pasa si todavía tengo acné activo?", "El control del acné suele ser una prioridad antes de tratar cicatrices de forma intensiva."],
    ],
    priceFrom: 850,
    priceNote,
    categorySlugs: ["cicatrices-acne"],
    image: "/images/cat-cicatrices-acne.jpg",
    keywords: ["cicatrices de acné", "láser cicatrices acné", "ice pick", "boxcar", "rolling", "subcisión", "textura facial"],
  },
};

export const routeList = Object.values(routes);

export function routeForCategory(categorySlug: string) {
  return routeList.find((route) => route.categorySlugs.includes(categorySlug));
}
