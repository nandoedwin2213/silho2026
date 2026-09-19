import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { MedicalDisclaimer } from "@/components/site/disclaimers";
import { db } from "@/lib/db";
import { blogImage } from "@/lib/images";

type Props = { params: Promise<{ slug: string }> };

async function getPost(params: Props["params"]) {
  const { slug } = await params;
  return db.blogPost.findFirst({ where: { slug, published: true } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params);
  return { title: post ? `${post.title} | Blog SILHO` : "Blog SILHO", description: post?.excerpt };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost(params);
  if (!post) notFound();
  const html = sanitizeHtml(await marked.parse(post.content), { allowedTags: ["p", "h2", "h3", "strong", "em", "ul", "ol", "li", "a", "blockquote"], allowedAttributes: { a: ["href", "target", "rel"] } });
  return <main className="mx-auto max-w-4xl px-6 py-16 lg:px-10 lg:py-24"><div className="relative aspect-[21/9] overflow-hidden rounded-3xl"><Image src={blogImage(post.category, post.coverImage)} alt={post.title} fill sizes="(max-width: 1024px) 100vw, 896px" className="object-cover" /></div><p className="mt-10 text-xs uppercase tracking-[0.2em] text-gold">{post.category}</p><h1 className="mt-4 font-heading text-5xl tracking-tight text-navy">{post.title}</h1><p className="mt-6 text-lg leading-8 text-muted-foreground">{post.excerpt}</p><article className="prose prose-slate mt-12 max-w-none prose-headings:font-heading prose-headings:text-navy prose-a:text-gold" dangerouslySetInnerHTML={{ __html: html }} /><MedicalDisclaimer className="mt-12 border-t pt-6" /></main>;
}
