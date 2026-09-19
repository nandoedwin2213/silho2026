import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function LegacyServiceRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await db.service.findUnique({ where: { slug }, include: { category: true } });
  if (!service) redirect("/tratamientos");
  redirect(`/tratamientos/${service.category.slug}/${service.slug}`);
}
