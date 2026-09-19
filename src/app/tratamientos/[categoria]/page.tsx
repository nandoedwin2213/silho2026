import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/site/section-heading";
import { ServiceCard } from "@/components/site/service-card";
import { db } from "@/lib/db";

type Props = { params: Promise<{ categoria: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const category = await db.category.findUnique({ where: { slug: categoria } });
  return { title: category ? `${category.name} | SILHO` : "Tratamientos | SILHO", description: category?.description ?? "Tratamientos de medicina estética en SILHO." };
}

export default async function CategoryPage({ params }: Props) {
  const { categoria } = await params;
  const category = await db.category.findUnique({ where: { slug: categoria }, include: { services: { where: { active: true }, orderBy: { name: "asc" } } } });
  if (!category || !category.active) notFound();
  return <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24"><SectionHeading eyebrow="Categoría SILHO" title={category.name} description={category.description ?? "Opciones para conversar durante tu valoración médica."} /><div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{category.services.map((service) => <ServiceCard key={service.id} service={service} categorySlug={category.slug} />)}</div></main>;
}
