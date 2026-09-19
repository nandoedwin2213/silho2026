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

export function categoryImage(slug: string, override?: string | null) {
  return usableOverride(override) || CATEGORY_IMAGES[slug] || SITE_IMAGES.clinic;
}

export function serviceImage(service: { image?: string | null }, categorySlug: string) {
  return categoryImage(categorySlug, service.image);
}

export function cityImage(city: string) {
  return CITY_IMAGES[key(city)] ?? SITE_IMAGES.clinic;
}

export function blogImage(category: string, override?: string | null) {
  return usableOverride(override) || BLOG_IMAGES[key(category)] || SITE_IMAGES.consultation;
}
