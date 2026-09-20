import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const landingSlugs = ["botox-salinas", "acido-hialuronico-salinas", "relleno-labios-salinas", "rinomodelacion-salinas", "tratamiento-acne-salinas", "full-face-salinas", "tratamiento-cicatrices-acne", "laser-cicatrices-acne", "rejuvenecimiento-facial-ecuador", "medicina-estetica-facial", "medicina-estetica-quito", "medicina-estetica-guayaquil", "medicina-estetica-salinas"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const [services, posts] = await Promise.all([
    db.service.findMany({ where: { active: true, category: { active: true } }, select: { slug: true, category: { select: { slug: true } }, updatedAt: true } }),
    db.blogPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);
  const staticRoutes = ["/", "/rejuvenecimiento-facial", "/acne", "/cicatrices-acne", "/casos-clinicos", "/beneficios", "/descubre-tu-ruta", "/politicas", "/tratamientos", "/dr-edwin-ayala", "/blog", "/membresias", "/contacto", "/privacidad", "/terminos", "/consentimiento-datos"];
  return [
    ...staticRoutes.map((path) => ({ url: `${base}${path}`, lastModified: new Date() })),
    ...landingSlugs.map((slug) => ({ url: `${base}/${slug}`, lastModified: new Date() })),
    ...services.map((service) => ({ url: `${base}/tratamientos/${service.category.slug}/${service.slug}`, lastModified: service.updatedAt })),
    ...posts.map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: post.updatedAt })),
  ];
}
