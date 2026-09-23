import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ServiceCard } from "@/components/site/service-card";
import { db } from "@/lib/db";
import { categoryImage } from "@/lib/images";

type Props = { params: Promise<{ categoria: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const category = await db.category.findUnique({ where: { slug: categoria } });
  return { title: category ? `${category.name} | SILHO` : "Tratamientos | SILHO", description: category?.description ?? "Tratamientos de medicina estética en SILHO." };
}

export default async function CategoryPage({ params }: Props) {
  const { categoria } = await params;
  const category = await db.category.findUnique({ where: { slug: categoria }, include: { services: { where: { active: true }, orderBy: [{ basePrice: "asc" }, { name: "asc" }] } } });
  if (!category || !category.active) notFound();
  return <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-16"><section className="relative min-h-[320px] overflow-hidden rounded-[2rem] bg-navy px-7 py-16 text-white md:px-12"><Image src={categoryImage(category.slug, category.image)} alt="" fill priority sizes="(max-width: 1280px) 100vw, 1280px" className="object-cover opacity-50" /><div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/75 to-navy/20" /><div className="relative"><p className="text-xs uppercase tracking-[0.24em] text-gold-light">Categoría SILHO</p><h1 className="mt-5 font-heading text-5xl tracking-tight md:text-6xl">{category.name}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">{category.description ?? "Opciones definidas durante su valoración médica."}</p></div></section><div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{category.services.map((service) => <ServiceCard key={service.id} service={service} categorySlug={category.slug} />)}</div></main>;
}
