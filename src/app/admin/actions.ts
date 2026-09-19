"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { serviceAdminSchema } from "@/lib/validation/service";
import { checkoutTotal } from "@/lib/order-total";
import { z } from "zod";

const idSchema = z.string().min(1);
const settingSchema = z.object({ discount: z.coerce.number().min(0).max(50), whatsapp: z.string().min(7), instagram: z.string().url().or(z.literal("")), tiktok: z.string().url().or(z.literal("")), facebook: z.string().url().or(z.literal("")), surgical: z.boolean(), email: z.string().email(), instructions: z.string().min(5) });

export async function logoutAction() {
  const { cookies } = await import("next/headers");
  (await cookies()).delete("silho-admin-session");
  redirect("/admin/login");
}

export async function toggleServiceAction(formData: FormData) {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  await db.service.update({ where: { id }, data: { active: formData.get("active") !== "true" } });
  revalidatePath("/admin/servicios"); revalidatePath("/tratamientos"); revalidatePath("/");
}

export async function saveServiceAction(formData: FormData) {
  await requireAdmin();
  const parsed = serviceAdminSchema.parse({
    name: formData.get("name"), slug: formData.get("slug"), categoryId: formData.get("categoryId"), description: formData.get("description"), shortDescription: formData.get("shortDescription"), basePrice: formData.get("basePrice"), priceFrom: formData.get("priceFrom") === "true", showPrice: formData.get("showPrice") === "true", discountEligible: formData.get("discountEligible") === "true", requiresMedicalAssessment: formData.get("requiresMedicalAssessment") === "true", requiresManualQuote: formData.get("requiresManualQuote") === "true", isSurgical: formData.get("isSurgical") === "true", active: formData.get("active") !== "false", featured: formData.get("featured") === "true", durationMinutes: formData.get("durationMinutes") || undefined, image: formData.get("image") || "",
    concerns: formData.getAll("concerns"),
  });
  const { concerns: concernSlugs, ...data } = parsed;
  const id = String(formData.get("id") || "");
  const service = id ? await db.service.update({ where: { id }, data }) : await db.service.create({ data });
  if (concernSlugs.length) {
    const concerns = await db.concern.findMany({ where: { slug: { in: concernSlugs } } });
    await db.serviceConcern.deleteMany({ where: { serviceId: service.id } });
    await db.serviceConcern.createMany({ data: concerns.map((concern) => ({ serviceId: service.id, concernId: concern.id })), skipDuplicates: true });
  }
  revalidatePath("/admin/servicios"); revalidatePath("/tratamientos"); revalidatePath("/");
  redirect("/admin/servicios");
}

export async function updateStatusAction(formData: FormData) {
  await requireAdmin();
  const model = String(formData.get("model"));
  const id = idSchema.parse(formData.get("id"));
  const status = String(formData.get("status"));
  if (model === "lead") await db.lead.update({ where: { id }, data: { status: status as never } });
  if (model === "appointment") await db.appointment.update({ where: { id }, data: { status: status as never } });
  if (model === "subscription") await db.subscription.update({ where: { id }, data: { status: status as never } });
  if (model === "order" && ["PAID", "PENDING", "FAILED", "CANCELLED", "REFUNDED"].includes(status)) await db.order.update({ where: { id }, data: { status: status as never } });
  revalidatePath(`/admin/${model === "appointment" ? "citas" : `${model}s`}`);
}

export async function saveSettingsAction(formData: FormData) {
  await requireAdmin();
  const data = settingSchema.parse({ discount: formData.get("discount"), whatsapp: formData.get("whatsapp"), instagram: formData.get("instagram") ?? "", tiktok: formData.get("tiktok") ?? "", facebook: formData.get("facebook") ?? "", surgical: formData.get("surgical") === "true", email: formData.get("email"), instructions: formData.get("instructions") });
  const values = { PRONTO_PAGO_DISCOUNT: String(data.discount), WHATSAPP_NUMBER: data.whatsapp, INSTAGRAM_URL: data.instagram, TIKTOK_URL: data.tiktok, FACEBOOK_URL: data.facebook, SHOW_SURGICAL_PRICES: String(data.surgical), CLINIC_EMAIL: data.email, BANK_TRANSFER_INSTRUCTIONS: data.instructions };
  for (const [key, value] of Object.entries(values)) {
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  revalidatePath("/"); revalidatePath("/admin/configuracion");
}

export async function markOrderPaidAction(formData: FormData) {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  await db.order.update({ where: { id }, data: { status: "PAID" } });
  revalidatePath("/admin/pedidos");
}

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin();
  const schema = z.object({ id: z.string().optional(), name: z.string().min(2), slug: z.string().regex(/^[a-z0-9-]+$/), description: z.string().optional(), order: z.coerce.number().int(), active: z.boolean() });
  const data = schema.parse({ id: formData.get("id") || undefined, name: formData.get("name"), slug: formData.get("slug"), description: formData.get("description") ?? "", order: formData.get("order"), active: formData.get("active") === "true" });
  if (data.id) await db.category.update({ where: { id: data.id }, data });
  else await db.category.create({ data });
  revalidatePath("/tratamientos"); revalidatePath("/admin/categorias");
}

export async function saveContentAction(formData: FormData) {
  await requireAdmin();
  const data = { title: String(formData.get("title")), slug: String(formData.get("slug")), excerpt: String(formData.get("excerpt") ?? ""), content: String(formData.get("content") ?? ""), category: String(formData.get("category") ?? ""), coverImage: String(formData.get("coverImage") ?? "") || null, published: formData.get("published") === "true", publishedAt: formData.get("published") === "true" ? new Date() : null };
  const id = String(formData.get("id") || "");
  if (id) await db.blogPost.update({ where: { id }, data });
  else await db.blogPost.create({ data });
  revalidatePath("/blog"); revalidatePath("/admin/blog");
}

export async function saveProfessionalAction(formData: FormData) {
  await requireAdmin();
  const arrayValue = (key: string) => JSON.stringify(String(formData.get(key) ?? "").split("\n").map((line) => line.trim()).filter(Boolean));
  const professional = await db.professional.findFirst({ where: { active: true } });
  if (!professional) return;
  await db.professional.update({ where: { id: professional.id }, data: { name: String(formData.get("name")), title: String(formData.get("title")), bio: String(formData.get("bio")), photo: String(formData.get("photo") ?? "") || null, education: arrayValue("education"), experience: arrayValue("experience"), certifications: arrayValue("certifications"), publications: arrayValue("publications"), procedures: arrayValue("procedures"), socials: arrayValue("socials") } });
  revalidatePath("/dr-edwin-ayala"); revalidatePath("/"); revalidatePath("/admin/profesional");
}

export async function saveLocationAction(formData: FormData) {
  await requireAdmin();
  const schema = z.object({ id: z.string().optional(), name: z.string().min(2), city: z.string().min(2), address: z.string().min(2), phone: z.string().optional(), mapsUrl: z.string().url().or(z.literal("")), order: z.coerce.number().int(), active: z.boolean() });
  const data = schema.parse({ id: formData.get("id") || undefined, name: formData.get("name"), city: formData.get("city"), address: formData.get("address"), phone: formData.get("phone") ?? "", mapsUrl: formData.get("mapsUrl") ?? "", order: formData.get("order"), active: formData.get("active") === "true" });
  if (data.id) await db.location.update({ where: { id: data.id }, data });
  else await db.location.create({ data });
  revalidatePath("/", "layout"); revalidatePath("/admin/sedes");
}

export async function saveBeforeAfterAction(formData: FormData) {
  await requireAdmin();
  const data = { title: String(formData.get("title")), beforeImage: String(formData.get("beforeImage")), afterImage: String(formData.get("afterImage")), patientConsent: formData.get("patientConsent") === "true", published: formData.get("published") === "true", description: String(formData.get("description") ?? "") || null };
  if (!data.patientConsent) throw new Error("El consentimiento del paciente es obligatorio.");
  await db.beforeAfter.create({ data });
  revalidatePath("/admin/antes-y-despues");
}

export { checkoutTotal };
