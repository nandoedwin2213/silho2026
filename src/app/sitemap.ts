import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const landingSlugs = ["trasplante-capilar", "blefaroplastia", "rinoplastia", "perfilamiento-facial", "botox", "acido-hialuronico", "acne", "cicatrices-acne", "laser-co2", "rejuvenecimiento-facial", "medicina-estetica-quito", "medicina-estetica-guayaquil", "medicina-estetica-salinas"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const [services, posts] = await Promise.all([
    db.service.findMany({ where: { active: true }, select: { slug: true, category: { select: { slug: true } }, updatedAt: true } }),
    db.blogPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);
  const staticRoutes = ["/", "/tratamientos", "/dr-edwin-ayala", "/agenda", "/blog", "/membresias", "/contacto", "/privacidad", "/terminos", "/consentimiento-datos"];
  return [
    ...staticRoutes.map((path) => ({ url: `${base}${path}`, lastModified: new Date() })),
    ...landingSlugs.map((slug) => ({ url: `${base}/${slug}`, lastModified: new Date() })),
    ...services.map((service) => ({ url: `${base}/tratamientos/${service.category.slug}/${service.slug}`, lastModified: service.updatedAt })),
    ...posts.map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: post.updatedAt })),
  ];
}
