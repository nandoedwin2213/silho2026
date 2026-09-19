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
  ["Valoración", "valoracion", "Valoraciones médicas para orientar tu plan estético."],
  ["Toxina botulínica", "toxina-botulinica", "Opciones de toxina botulínica según valoración médica."],
  ["Ácido hialurónico", "acido-hialuronico", "Tratamientos con ácido hialurónico para armonización facial."],
  ["Acné", "acne", "Opciones para conversar durante tu valoración de acné."],
  ["Cicatrices de acné", "cicatrices-acne", "Tratamientos orientados a atenuar cicatrices y estimular remodelación."],
  ["Rejuvenecimiento facial", "rejuvenecimiento-facial", "Alternativas de rejuvenecimiento facial personalizado."],
  ["Medicina capilar", "medicina-capilar", "Valoración y seguimiento de salud capilar."],
  ["Trasplante capilar", "trasplante-capilar", "Procedimientos capilares que requieren valoración médica previa."],
  ["Blefaroplastia", "blefaroplastia", "Procedimientos perioculares sujetos a valoración médica."],
  ["Rinoplastia", "rinoplastia", "Opciones nasales sujetas a valoración médica."],
  ["Perfilamiento y armonización facial", "perfilamiento-facial", "Planes de armonización que comienzan con valoración."],
  ["Otros procedimientos", "otros-procedimientos", "Catálogo administrable de opciones estéticas."],
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

async function main() {
  for (const [order, [name, slug, description]] of categorySeeds.entries()) {
    await prisma.category.upsert({
      where: { slug },
      update: { name, description, order, active: true },
      create: { name, slug, description, order },
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

  const blogCategories = ["Acné", "Rejuvenecimiento", "Ácido hialurónico", "Botox", "Capilar", "Cicatrices", "Láser", "Armonización facial"];
  for (const category of blogCategories) {
    const slug = slugify(category);
    await prisma.blogPost.upsert({
      where: { slug: `guia-${slug}` },
      update: { title: `Guía SILHO: ${category}`, excerpt: `Información general sobre ${category.toLowerCase()}.`, content: `## ${category}\n\nConversa con nuestro equipo durante una valoración personalizada.`, category, published: true, publishedAt: new Date() },
      create: { slug: `guia-${slug}`, title: `Guía SILHO: ${category}`, excerpt: `Información general sobre ${category.toLowerCase()}.`, content: `## ${category}\n\nConversa con nuestro equipo durante una valoración personalizada.`, category, published: true, publishedAt: new Date() },
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
