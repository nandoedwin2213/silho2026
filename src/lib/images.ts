const CATEGORY_IMAGES: Record<string, string> = {
  valoracion: "/images/cat-valoracion.jpg",
  "toxina-botulinica": "/images/cat-toxina-botulinica.jpg",
  "acido-hialuronico": "/images/cat-acido-hialuronico.jpg",
  acne: "/images/cat-acne.jpg",
  "cicatrices-acne": "/images/cat-cicatrices-acne.jpg",
  "rejuvenecimiento-facial": "/images/cat-rejuvenecimiento-facial.jpg",
  "medicina-capilar": "/images/cat-medicina-capilar.jpg",
  "trasplante-capilar": "/images/cat-trasplante-capilar.jpg",
  blefaroplastia: "/images/cat-blefaroplastia.jpg",
  rinoplastia: "/images/cat-rinoplastia.jpg",
  "perfilamiento-facial": "/images/cat-perfilamiento-facial.jpg",
  "otros-procedimientos": "/images/cat-otros-procedimientos.jpg",
};

const CITY_IMAGES: Record<string, string> = {
  quito: "/images/quito.jpg",
  guayaquil: "/images/guayaquil.jpg",
  salinas: "/images/salinas.jpg",
};

const BLOG_IMAGES: Record<string, string> = {
  acne: "/images/blog-acne.jpg",
  rejuvenecimiento: "/images/blog-rejuvenecimiento.jpg",
  "acido-hialuronico": "/images/blog-acido-hialuronico.jpg",
  botox: "/images/blog-botox.jpg",
  capilar: "/images/blog-capilar.jpg",
  cicatrices: "/images/blog-cicatrices.jpg",
  laser: "/images/blog-laser.jpg",
  "armonizacion-facial": "/images/blog-armonizacion-facial.jpg",
};

export const SERVICE_TOPIC_IMAGES: Record<string, string> = {
  labios: "/images/svc-labios.jpg",
  pomulos: "/images/svc-pomulos.jpg",
  "menton-mandibula": "/images/svc-menton-mandibula.jpg",
  ojeras: "/images/svc-ojeras.jpg",
  nariz: "/images/svc-nariz.jpg",
  "frente-entrecejo": "/images/svc-frente-entrecejo.jpg",
  "patas-de-gallo": "/images/svc-patas-de-gallo.jpg",
  sonrisa: "/images/svc-sonrisa.jpg",
  "maseteros-bruxismo": "/images/svc-maseteros-bruxismo.jpg",
  "cuello-papada": "/images/svc-cuello-papada.jpg",
  "limpieza-facial": "/images/svc-limpieza-facial.jpg",
  peeling: "/images/svc-peeling.jpg",
  "microneedling-dermapen": "/images/svc-microneedling-dermapen.jpg",
  prp: "/images/svc-prp.jpg",
  laser: "/images/svc-laser.jpg",
  subcision: "/images/svc-subcision.jpg",
  bioestimuladores: "/images/svc-bioestimuladores.jpg",
  hilos: "/images/svc-hilos.jpg",
  "skinboosters-hidratacion": "/images/svc-skinboosters-hidratacion.jpg",
  valoracion: "/images/svc-valoracion.jpg",
  "plan-integral": "/images/svc-plan-integral.jpg",
  "manchas-melasma": "/images/svc-manchas-melasma.jpg",
  rosacea: "/images/svc-rosacea.jpg",
  "poros-textura": "/images/svc-poros-textura.jpg",
  flacidez: "/images/svc-flacidez.jpg",
  manos: "/images/svc-manos.jpg",
  "tercio-medio": "/images/svc-tercio-medio.jpg",
  "full-face": "/images/svc-full-face.jpg",
  cejas: "/images/svc-cejas.jpg",
  capilar: "/images/svc-capilar.jpg",
};

const SERVICE_TOPIC_KEYWORDS: [string, string[]][] = [
  ["patas-de-gallo", ["patas de gallo"]],
  ["frente-entrecejo", ["frente", "entrecejo", "bunny"]],
  ["menton-mandibula", ["menton", "mandib", "jawline", "perfil mandibular"]],
  ["maseteros-bruxismo", ["masetero", "bruxismo"]],
  ["cuello-papada", ["cuello", "papada", "platisma"]],
  ["skinboosters-hidratacion", ["skinbooster", "profhilo", "hidrat", "mesoterapia"]],
  ["microneedling-dermapen", ["microneedling", "dermapen"]],
  ["bioestimuladores", ["bioestimul", "polilactico", "hidroxiapatita", "radiesse", "sculptra"]],
  ["manchas-melasma", ["mancha", "melasma", "fotoenvejec"]],
  ["poros-textura", ["poro", "textura"]],
  ["plan-integral", ["plan", "protocolo", "integral", "tratamiento de acne", "tratamiento del acne"]],
  ["full-face", ["full face", "armonizacion"]],
  ["tercio-medio", ["tercio medio"]],
  ["limpieza-facial", ["limpieza"]],
  ["peeling", ["peeling", "tca"]],
  ["subcision", ["subcisi"]],
  ["laser", ["laser", "co2", "ipl", "luz pulsada"]],
  ["prp", ["prp", "pdrn"]],
  ["flacidez", ["flacidez", "tensado"]],
  ["rosacea", ["rosacea"]],
  ["hilos", ["hilos"]],
  ["sonrisa", ["gingival", "sonrisa"]],
  ["labios", ["labio"]],
  ["pomulos", ["pomulo"]],
  ["ojeras", ["ojera"]],
  ["nariz", ["nariz", "nasal", "rino"]],
  ["manos", ["manos"]],
  ["cejas", ["ceja"]],
  ["capilar", ["capilar", "alopecia", "anticaida", "fue", "injerto", "coronilla", "entradas", "barba"]],
  ["valoracion", ["valoracion", "evaluacion", "consulta", "diagnostico"]],
];

export const SITE_IMAGES = {
  hero: "/images/hero.jpg",
  clinic: "/images/clinic.jpg",
  consultation: "/images/consultation.jpg",
  doctor: "/images/doctor.jpg",
  agenda: "/images/agenda.jpg",
  membresias: "/images/membresias.jpg",
};

function key(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function usableOverride(value?: string | null) {
  return value && (value.startsWith("/") || value.startsWith("https://")) ? value : null;
}

function normalizedText(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

export function serviceTopic(name: string): string | null {
  const normalized = normalizedText(name);
  return SERVICE_TOPIC_KEYWORDS.find(([, keywords]) => keywords.some((keyword) => normalized.includes(normalizedText(keyword))))?.[0] ?? null;
}

export function categoryImage(slug: string, override?: string | null) {
  return usableOverride(override) || CATEGORY_IMAGES[slug] || SITE_IMAGES.clinic;
}

export function serviceImage(service: { name?: string; image?: string | null }, categorySlug: string) {
  return usableOverride(service.image) || (service.name ? SERVICE_TOPIC_IMAGES[serviceTopic(service.name) ?? ""] : null) || categoryImage(categorySlug);
}

export function cityImage(city: string) {
  return CITY_IMAGES[key(city)] ?? SITE_IMAGES.clinic;
}

export function blogImage(category: string, override?: string | null) {
  return usableOverride(override) || BLOG_IMAGES[key(category)] || SITE_IMAGES.consultation;
}
