import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminHeading } from "../_components";
import { saveContentAction } from "../actions";

const categories = ["Acné", "Rejuvenecimiento", "Ácido hialurónico", "Botox", "Capilar", "Cicatrices", "Láser", "Armonización facial"];

export default async function AdminBlogPage() {
  await requireAdmin();
  const posts = await db.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
  return <><AdminHeading title="Blog" /><div className="grid gap-6 lg:grid-cols-[1fr_400px]"><div className="rounded-2xl border bg-white p-5 shadow-sm">{posts.map((post) => <div key={post.id} className="border-b p-3"><p className="font-semibold text-navy">{post.title}</p><p className="text-xs text-muted-foreground">{post.category} · {post.published ? "Publicado" : "Borrador"}</p></div>)}</div><form action={saveContentAction} className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm"><h2 className="font-heading text-xl text-navy">Nuevo artículo</h2><input name="title" required placeholder="Título" className="h-9 w-full rounded-lg border px-3 text-sm" /><input name="slug" required placeholder="slug" className="h-9 w-full rounded-lg border px-3 text-sm" /><input name="excerpt" required placeholder="Extracto" className="h-9 w-full rounded-lg border px-3 text-sm" /><select name="category" className="h-9 w-full rounded-lg border px-3 text-sm">{categories.map((category) => <option key={category}>{category}</option>)}</select><textarea name="content" required placeholder="Markdown" rows={8} className="w-full rounded-lg border p-3 text-sm" /><label className="flex gap-2 text-sm"><input type="checkbox" name="published" value="true" /> Publicado</label><button className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white">Guardar artículo</button></form></div></>;
}
