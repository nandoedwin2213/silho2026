export type LandingConfig = {
  categorySlug?: string;
  title: string;
  intro: string;
  eyebrow?: string;
  faq?: [string, string][];
  methods?: string[];
  disclaimer?: string;
  city?: string;
};

export const landingConfigs: Record<string, LandingConfig> = {
  "trasplante-capilar": {
    categorySlug: "trasplante-capilar",
    title: "Trasplante Capilar",
    intro: "Recupera tu planificación capilar con una valoración médica previa y un plan acorde a tus necesidades.",
    eyebrow: "Medicina capilar",
    methods: ["FUE", "Microinjerto capilar", "Diseño de línea frontal", "Restauración de entradas", "Coronilla", "Barba", "Cejas"],
    disclaimer: "Requiere valoración médica previa. El valor depende del número de unidades foliculares, área, técnica y planificación médica.",
    faq: [["¿Puedo comprar el procedimiento directamente?", "No. El trasplante capilar requiere valoración médica previa y planificación individual."], ["¿De qué depende el valor?", "Depende del número de unidades foliculares, el área, la técnica y la planificación médica."]],
  },
  blefaroplastia: {
    categorySlug: "blefaroplastia",
    title: "Blefaroplastia",
    intro: "Procedimientos perioculares sujetos a valoración, indicación médica, habilitación profesional y establecimiento autorizado.",
    eyebrow: "Procedimientos perioculares",
    methods: ["Blefaroplastia superior", "Blefaroplastia inferior", "Superior + inferior", "Evaluación periocular"],
    disclaimer: "Procedimiento sujeto a valoración, indicación médica, habilitación profesional y establecimiento autorizado. No se prometen resultados.",
  },
  rinoplastia: {
    categorySlug: "rinoplastia",
    title: "Rinoplastia",
    intro: "Explora opciones estéticas y funcionales para conversar durante una valoración médica.",
    eyebrow: "Estética de cabeza y cuello",
    methods: ["Valoración de nariz", "Rinoplastia estética", "Rinoplastia funcional", "Rinoplastia estética + funcional", "Rinoplastia secundaria", "Rinomodelación no quirúrgica"],
    disclaimer: "La rinoplastia quirúrgica requiere valoración médica y no puede comprarse directamente. No se prometen resultados.",
  },
  "perfilamiento-facial": {
    categorySlug: "perfilamiento-facial",
    title: "Perfilamiento y Armonización Facial",
    intro: "Planes premium para conversar durante tu valoración, sin recomendaciones automáticas ni fórmulas universales.",
    eyebrow: "Armonización facial",
    methods: ["ESSENTIAL", "ADVANCED", "FULL FACE"],
    disclaimer: "Los paquetes no recomiendan tratamientos automáticamente. La indicación depende de una valoración médica personalizada.",
  },
  botox: {
    categorySlug: "toxina-botulinica",
    title: "Toxina botulínica",
    intro: "Opciones para conversar durante tu valoración médica y diseñar un plan natural y personalizado.",
    eyebrow: "Medicina estética facial",
    faq: [["¿Cuándo sabré qué zonas tratar?", "La indicación se define durante la valoración según tus objetivos y anatomía."]],
  },
  "acido-hialuronico": {
    categorySlug: "acido-hialuronico",
    title: "Ácido hialurónico",
    intro: "Alternativas de armonización facial que parten de una conversación médica y una indicación individual.",
    eyebrow: "Armonización facial",
  },
  acne: {
    categorySlug: "acne",
    title: "Acné",
    intro: "Opciones para cuidar tu piel y conversar durante una valoración médica personalizada.",
    eyebrow: "Salud estética",
  },
  "cicatrices-acne": {
    categorySlug: "cicatrices-acne",
    title: "Cicatrices de acné",
    intro: "Un plan personalizado puede mejorar, atenuar y estimular la remodelación de diferentes tipos de cicatrices.",
    eyebrow: "Cuidado de la piel",
    disclaimer: "Las cicatrices pueden ser ice pick, boxcar o rolling. No se promete eliminación completa; el objetivo es mejorar y atenuar.",
  },
  "laser-co2": {
    categorySlug: "acne",
    title: "Láser CO2",
    intro: "Conversa sobre láser CO2 y otras alternativas durante una valoración médica personalizada.",
    eyebrow: "Tecnología médica",
  },
  "rejuvenecimiento-facial": {
    categorySlug: "rejuvenecimiento-facial",
    title: "Rejuvenecimiento facial",
    intro: "Alternativas para cuidar la calidad de tu piel, suavizar signos visibles y acompañar tu proceso de forma personalizada.",
    eyebrow: "Rejuvenecimiento",
  },
  "medicina-estetica-quito": { title: "Medicina estética en Quito", intro: "Atención estética personalizada en Quito, con valoración médica y opciones faciales, capilares y de rejuvenecimiento.", city: "Quito" },
  "medicina-estetica-guayaquil": { title: "Medicina estética en Guayaquil", intro: "Atención estética personalizada en Guayaquil, con valoración médica y opciones faciales, capilares y de rejuvenecimiento.", city: "Guayaquil" },
  "medicina-estetica-salinas": { title: "Medicina estética en Salinas", intro: "Atención estética personalizada en Salinas, con valoración médica y opciones faciales, capilares y de rejuvenecimiento.", city: "Salinas" },
};
