export type LandingConfig = {
  categorySlug?: string;
  routeSlug?: "rejuvenecimiento-facial" | "acne" | "cicatrices-acne";
  title: string;
  intro: string;
  eyebrow?: string;
  faq?: [string, string][];
  methods?: string[];
  disclaimer?: string;
  city?: string;
};

export const landingConfigs: Record<string, LandingConfig> = {
  "perfilamiento-facial": {
    categorySlug: "perfilamiento-facial",
    title: "Perfilamiento y Armonización Facial",
    intro: "Planes premium definidos durante su valoración, sin recomendaciones automáticas ni fórmulas universales.",
    eyebrow: "Armonización facial",
    methods: ["ESSENTIAL", "ADVANCED", "FULL FACE"],
    disclaimer: "Los paquetes no recomiendan tratamientos automáticamente. La indicación depende de una valoración médica personalizada.",
  },
  botox: {
    categorySlug: "toxina-botulinica",
    title: "Toxina botulínica",
    intro: "Opciones faciales para diseñar un plan natural y personalizado durante su valoración médica.",
    eyebrow: "Medicina estética facial",
    faq: [["¿Cuándo sabré qué zonas tratar?", "La indicación se define durante la valoración según tus objetivos y anatomía."]],
  },
  "acido-hialuronico": {
    categorySlug: "acido-hialuronico",
    title: "Ácido hialurónico",
    intro: "Alternativas de armonización facial que parten de una valoración médica y una indicación individual.",
    eyebrow: "Armonización facial",
  },
  "laser-co2": {
    categorySlug: "acne",
    title: "Láser CO2",
    intro: "Evalúe láser CO2 y otras alternativas durante una valoración médica personalizada.",
    eyebrow: "Tecnología médica",
  },
  "botox-salinas": { categorySlug: "toxina-botulinica", title: "Toxina botulínica en Salinas", intro: "Evaluamos líneas de expresión y diseñamos un plan facial personalizado en Salinas.", city: "Salinas", eyebrow: "Medicina estética facial" },
  "acido-hialuronico-salinas": { categorySlug: "acido-hialuronico", title: "Ácido hialurónico en Salinas", intro: "Alternativas de armonización facial que parten de una valoración médica en Salinas.", city: "Salinas", eyebrow: "Armonización facial" },
  "relleno-labios-salinas": { categorySlug: "acido-hialuronico", title: "Relleno de labios en Salinas", intro: "Evaluamos proporción, definición e hidratación de labios con una valoración individual.", city: "Salinas", eyebrow: "Armonización facial" },
  "rinomodelacion-salinas": { categorySlug: "acido-hialuronico", title: "Rinomodelación en Salinas", intro: "La indicación de un perfilamiento nasal sin cirugía depende de una valoración médica.", city: "Salinas", eyebrow: "Armonización facial", disclaimer: "No se prometen resultados. La indicación depende de una valoración médica individual." },
  "tratamiento-acne-salinas": { categorySlug: "acne", routeSlug: "acne", title: "Tratamiento del acné en Salinas", intro: "Tratamos el acné activo antes de que deje nuevas cicatrices, con un plan médico individual.", city: "Salinas", eyebrow: "Ruta SILHO · Acné" },
  "full-face-salinas": { categorySlug: "rejuvenecimiento-facial", routeSlug: "rejuvenecimiento-facial", title: "Full Face personalizado en Salinas", intro: "Rejuvenecer no significa cambiar su rostro. Comenzamos con una valoración facial completa.", city: "Salinas", eyebrow: "Ruta SILHO · Rejuvenecimiento facial" },
  "tratamiento-cicatrices-acne": { categorySlug: "cicatrices-acne", routeSlug: "cicatrices-acne", title: "Tratamiento de cicatrices de acné", intro: "Cada cicatriz requiere una estrategia diferente. Evaluamos tipo, profundidad y contexto.", eyebrow: "Ruta SILHO · Cicatrices de acné", disclaimer: "No se promete eliminación completa; el plan depende de una valoración médica individual." },
  "laser-cicatrices-acne": { categorySlug: "cicatrices-acne", routeSlug: "cicatrices-acne", title: "Láser para cicatrices de acné", intro: "El láser fraccionado puede indicarse para cicatrices seleccionadas después de una valoración.", eyebrow: "Tecnología facial", disclaimer: "La indicación depende del tipo de cicatriz, la piel y una valoración médica individual." },
  "rejuvenecimiento-facial-ecuador": { categorySlug: "rejuvenecimiento-facial", routeSlug: "rejuvenecimiento-facial", title: "Rejuvenecimiento facial en Ecuador", intro: "Diseñamos tratamientos faciales que respetan su identidad y comienzan con una valoración.", eyebrow: "Medicina estética facial" },
  "medicina-estetica-facial": { title: "Medicina estética facial", intro: "SILHO es una clínica premium especializada exclusivamente en rostro: valoración, acné, cicatrices y rejuvenecimiento facial.", eyebrow: "SILHO · Rostro" },
  "medicina-estetica-quito": { title: "Medicina estética facial en Quito", intro: "Atención facial personalizada en Quito, con valoración médica y planes que respetan su identidad.", city: "Quito" },
  "medicina-estetica-guayaquil": { title: "Medicina estética facial en Guayaquil", intro: "Atención facial personalizada en Guayaquil, con valoración médica y planes que respetan su identidad.", city: "Guayaquil" },
  "medicina-estetica-salinas": { title: "Medicina estética facial en Salinas", intro: "Atención facial personalizada en Salinas, con valoración médica y planes que respetan su identidad.", city: "Salinas" },
};

export function cityLandingPath(city: string) {
  const slug = "medicina-estetica-" + city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
  return slug in landingConfigs ? `/${slug}` : "/contacto";
}
