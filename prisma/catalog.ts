export type CatalogCategory = {
  name: string;
  slug: string;
  description: string;
  image: string;
};

export type CatalogService = {
  name: string;
  slug: string;
  category: string;
  price: number;
  webPrice: number;
  shortDescription: string;
  description: string;
  featured?: boolean;
  durationMinutes: number;
  concerns?: string[];
};

export const catalogCategories: CatalogCategory[] = [
  ["Valoración médica facial", "consultas", "Evaluación médica para entender sus objetivos y definir un plan correcto.", "/images/cat-valoracion.jpg"],
  ["Toxina botulínica", "toxina-botulinica", "Tratamientos guiados por anatomía y movimiento para conservar una expresión natural.", "/images/cat-toxina-botulinica.jpg"],
  ["Ácido hialurónico y armonización facial", "acido-hialuronico", "Armonización facial basada en proporciones, anatomía y objetivos individuales.", "/images/cat-acido-hialuronico.jpg"],
  ["Bioestimulación y rejuvenecimiento", "bioestimulacion", "Alternativas progresivas para acompañar la calidad y firmeza de la piel.", "/images/cat-rejuvenecimiento-facial.jpg"],
  ["Láseres, manchas y calidad de piel", "laser-piel", "Tecnologías y procedimientos para tratar textura, tono y renovación cutánea.", "/images/svc-laser.jpg"],
  ["Acné y cicatrices", "acne-cicatrices", "Protocolos médicos para controlar el acné y tratar sus marcas.", "/images/cat-acne.jpg"],
  ["Protocolos completos", "protocolos", "Planes integrales que combinan procedimientos cuando la valoración lo indica.", "/images/svc-full-face.jpg"],
].map(([name, slug, description, image]) => ({ name, slug, description, image }));

export const catalogServices: CatalogService[] = [
  ["Valoración estética facial", "valoracion-valoracion-estetica-facial", "consultas", 40, 30, "Evaluación médica del rostro para definir un plan.", "Evaluación médica integral del rostro, sus proporciones, antecedentes y objetivos para definir un plan seguro y personalizado.", 60, ["Arrugas", "Rejuvenecimiento"]],
  ["Toxina botulínica tercio superior · Upper Face 18", "upper-face-18", "toxina-botulinica", 350, 250, "Técnica de 18 puntos con toxina botulínica en el tercio superior facial.", "Aplicación médica de toxina botulínica en 18 puntos del tercio superior facial, indicada según movimiento, anatomía y objetivos.", 60, true],
  ["Rejuvenecimiento de cuello · Neck Lift Botox", "neck-lift-botox", "toxina-botulinica", 400, 300, "Aplicación de toxina botulínica en platisma para mejorar cuello y definición.", "Aplicación de toxina botulínica en el músculo platisma para mejorar la apariencia y definición del cuello cuando la valoración lo indica.", 60],
  ["Armonización de labios · Lip Design", "lip-design", "acido-hialuronico", 300, 250, "Relleno, hidratación y armonización de labios con ácido hialurónico.", "Diseño médico de labios con ácido hialurónico para conversar sobre definición, hidratación y armonización respetando las proporciones.", 60, true],
  ["Rinomodelación con ácido hialurónico · Rhino Profile", "rhino-profile", "acido-hialuronico", 350, 300, "Rinomodelación y perfilamiento nasal con ácido hialurónico.", "Rinomodelación no quirúrgica con ácido hialurónico para mejorar el perfil nasal únicamente cuando la anatomía y seguridad lo permiten.", 60],
  ["Proyección de pómulos · Midface Lift", "midface-lift", "acido-hialuronico", 350, 200, "Relleno y proyección de pómulos con ácido hialurónico.", "Tratamiento de pómulos con ácido hialurónico para valorar soporte, proyección y equilibrio del tercio medio facial.", 60],
  ["Bioestimulación con ácido poliláctico · Collagen Sculpt", "collagen-sculpt", "bioestimulacion", 450, 400, "Bioestimulación facial con ácido poliláctico para favorecer colágeno.", "Bioestimulación facial con ácido poliláctico para favorecer progresivamente la producción de colágeno, con indicación y seguimiento médico.", 75],
  ["Láser CO₂ fraccionado · Skin Renew CO₂", "skin-renew-co2", "laser-piel", 150, 100, "Una sesión de láser CO₂ fraccionado para renovar la textura.", "Sesión de láser CO₂ fraccionado orientada a la renovación y mejoramiento de la textura cutánea según diagnóstico médico.", 60],
  ["Láser CO₂ + plasma rico en plaquetas · CO₂ Plasma Repair", "co2-plasma-repair", "laser-piel", 200, 150, "Láser CO₂ fraccionado combinado con plasma rico en plaquetas.", "Sesión de láser CO₂ fraccionado combinada con plasma rico en plaquetas para apoyar la renovación de la piel cuando corresponde.", 90],
  ["Picoláser para manchas · PicoClear", "picoclear", "laser-piel", 100, 75, "Sesión de picoláser orientada al tratamiento de manchas.", "Sesión de picoláser orientada al tratamiento de manchas y alteraciones de tono, siempre después de un diagnóstico médico.", 45],
  ["Peeling de fenol · Phenol Renewal", "phenol-renewal", "laser-piel", 300, 200, "Peeling facial con fenol bajo indicación y supervisión médica.", "Peeling facial con fenol indicado y supervisado por el equipo médico, con preparación y cuidados definidos para cada piel.", 75],
  ["Limpieza facial profunda · Deep Glow Facial", "deep-glow-facial", "laser-piel", 50, 38, "Limpieza facial profunda y cuidado personalizado de la piel.", "Limpieza facial profunda con cuidado personalizado para retirar impurezas y acompañar las necesidades actuales de la piel.", 60],
  ["Protocolo integral de acné · Acne Control 360", "acne-control-360", "acne-cicatrices", 650, 600, "Protocolo de 15 sesiones de limpieza con peeling más kit domiciliario.", "Protocolo de 15 sesiones de limpieza facial con peeling y kit domiciliario para el tratamiento médico y progresivo del acné.", 90, true],
  ["Subcisión de cicatrices · Scar Release", "scar-release", "acne-cicatrices", 300, 250, "Subcisión médica para liberar adherencias de cicatrices deprimidas.", "Subcisión médica orientada a liberar adherencias relacionadas con cicatrices deprimidas de acné, después de valorar su tipo y profundidad.", 60],
  ["Protocolo de cicatrices de acné · Acne Scar Recovery", "acne-scar-recovery", "acne-cicatrices", 900, 850, "Protocolo de láser CO₂, peeling de fenol y subcisión.", "Protocolo compuesto por ocho sesiones de láser CO₂ fraccionado, un peeling de fenol y una subcisión según indicación médica.", 90],
  ["Armonización facial integral · Full Face Signature", "full-face-signature", "protocolos", 1200, 900, "Protocolo de armonización integral con varias técnicas faciales.", "Protocolo de armonización integral que incluye rinomodelación, labios, mentón, toxina botulínica y una sesión de láser CO₂ cuando la valoración lo indica.", 180, true],
].map(([name, slug, category, price, webPrice, shortDescription, description, durationMinutes, featuredOrConcerns, concerns]) => ({
  name,
  slug,
  category,
  price,
  webPrice,
  shortDescription,
  description,
  durationMinutes,
  ...(typeof featuredOrConcerns === "boolean" ? { featured: featuredOrConcerns } : { concerns: featuredOrConcerns }),
  ...(concerns ? { concerns } : {}),
} as CatalogService));
