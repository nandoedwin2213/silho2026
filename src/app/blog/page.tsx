import Link from "next/link";
import Image from "next/image";
import { SectionHeading } from "@/components/site/section-heading";
import { db } from "@/lib/db";
import { blogImage } from "@/lib/images";

export const metadata = { title: "Blog | SILHO Medicina Estética", description: "Información de medicina estética para acompañar tus decisiones." };

export default async function BlogPage() {
  const posts = await db.blogPost.findMany({ where: { published: true }, orderBy: { publishedAt: "desc" } });
  const categories = Array.from(new Set(posts.map((post) => post.category)));
  return <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24"><SectionHeading eyebrow="Blog SILHO" title="Información para decidir con calma" description="Contenido general para preparar su valoración médica." /><div className="mt-8 flex flex-wrap gap-2">{categories.map((category) => <span key={category} className="rounded-full border px-4 py-2 text-sm text-muted-foreground">{category}</span>)}</div><div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <Link key={post.id} href={`/blog/${post.slug}`} className="overflow-hidden rounded-2xl border transition hover:-translate-y-0.5 hover:border-gold hover:shadow-sm"><div className="relative aspect-[16/10]"><Image src={blogImage(post.category, post.coverImage)} alt={post.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" /></div><div className="p-6"><p className="text-xs uppercase tracking-[0.18em] text-gold">{post.category}</p><h2 className="mt-4 font-heading text-2xl text-navy">{post.title}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p><p className="mt-6 text-sm font-semibold text-navy">Leer artículo →</p></div></Link>)}</div></main>;
}
