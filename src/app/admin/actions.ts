"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { serviceAdminSchema } from "@/lib/validation/service";
import { checkoutTotal } from "@/lib/order-total";
import { z } from "zod";
import { AppointmentStatus, LeadStatus, SubscriptionStatus } from "@prisma/client";
import { markOrderPaid, reverseOrderRedemption } from "@/lib/orders";
import { awardPoints } from "@/lib/rewards";

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
  await db.serviceConcern.deleteMany({ where: { serviceId: service.id } });
  if (concernSlugs.length) {
    const concerns = await db.concern.findMany({ where: { slug: { in: concernSlugs } } });
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
  if (model === "lead") await db.lead.update({ where: { id }, data: { status: z.nativeEnum(LeadStatus).parse(status) } });
  else if (model === "appointment") {
    const nextStatus = z.nativeEnum(AppointmentStatus).parse(status);
    await db.$transaction(async (tx) => {
      const appointment = await tx.appointment.update({ where: { id }, data: { status: nextStatus } });
      if (nextStatus === "COMPLETED") {
        const existing = await tx.pointsTransaction.findFirst({ where: { appointmentId: id, reason: "PUNCTUAL_ATTENDANCE" } });
        if (!existing) await awardPoints(tx, { patientId: appointment.patientId, points: 25, reason: "PUNCTUAL_ATTENDANCE", description: "Cita completada en SILHO.", appointmentId: id });
      }
    });
  }
  else if (model === "subscription") await db.subscription.update({ where: { id }, data: { status: z.nativeEnum(SubscriptionStatus).parse(status) } });
  else if (model === "order" && ["PAID", "PENDING", "FAILED", "CANCELLED", "REFUNDED"].includes(status)) {
    if (status === "PAID") await markOrderPaid(id);
    else await db.$transaction(async (tx) => {
      await tx.order.update({ where: { id }, data: { status: status as "PENDING" | "FAILED" | "CANCELLED" | "REFUNDED" } });
      if (status === "FAILED" || status === "CANCELLED" || status === "REFUNDED") await reverseOrderRedemption(tx, id);
    });
  }
  else throw new Error("Modelo o estado inválido.");
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
  await markOrderPaid(id);
  revalidatePath("/admin/pedidos");
}

export async function adjustPointsAction(formData: FormData) {
  await requireAdmin();
  const points = z.coerce.number().int().refine((value) => value !== 0).parse(formData.get("points"));
  const reason = z.enum(["PROTOCOL_COMPLETED", "PUNCTUAL_ATTENDANCE", "FOLLOW_UP", "ANNIVERSARY", "ADJUSTMENT"]).parse(formData.get("reason"));
  const patientId = idSchema.parse(formData.get("patientId"));
  const description = z.string().min(3).parse(formData.get("description"));
  await db.$transaction((tx) => awardPoints(tx, { patientId, points, reason, description }));
  revalidatePath("/admin/rewards");
}

export async function toggleRewardAction(formData: FormData) {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const reward = await db.reward.findUniqueOrThrow({ where: { id }, select: { active: true } });
  await db.reward.update({ where: { id }, data: { active: !reward.active } });
  revalidatePath("/admin/rewards");
}

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin();
  const schema = z.object({ id: z.string().optional(), name: z.string().min(2), slug: z.string().regex(/^[a-z0-9-]+$/), description: z.string().optional(), order: z.coerce.number().int(), active: z.boolean(), image: z.string().url().or(z.literal("")) });
  const data = schema.parse({ id: formData.get("id") || undefined, name: formData.get("name"), slug: formData.get("slug"), description: formData.get("description") ?? "", order: formData.get("order"), active: formData.get("active") === "true", image: formData.get("image") ?? "" });
  const { id, ...categoryData } = data;
  if (id) await db.category.update({ where: { id }, data: categoryData });
  else await db.category.create({ data: categoryData });
  revalidatePath("/tratamientos"); revalidatePath("/admin/categorias");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const serviceCount = await db.service.count({ where: { categoryId: id } });
  if (serviceCount > 0) await db.category.update({ where: { id }, data: { active: false } });
  else await db.category.delete({ where: { id } });
  revalidatePath("/tratamientos"); revalidatePath("/admin/categorias");
}

export async function saveContentAction(formData: FormData) {
  await requireAdmin();
  const contentSchema = z.object({ title: z.string().min(2), slug: z.string().regex(/^[a-z0-9-]+$/), excerpt: z.string().min(2), content: z.string().min(2), category: z.string().min(2), coverImage: z.string().url().or(z.literal("")), published: z.boolean() });
  const parsed = contentSchema.parse({ title: formData.get("title"), slug: formData.get("slug"), excerpt: formData.get("excerpt") ?? "", content: formData.get("content") ?? "", category: formData.get("category") ?? "", coverImage: formData.get("coverImage") ?? "", published: formData.get("published") === "true" });
  const id = String(formData.get("id") || "");
  const existing = id ? await db.blogPost.findUnique({ where: { id }, select: { published: true, publishedAt: true } }) : null;
  const publishedAt = parsed.published ? (existing?.published ? existing.publishedAt : new Date()) : null;
  const data = { ...parsed, coverImage: parsed.coverImage || null, publishedAt };
  if (id) await db.blogPost.update({ where: { id }, data });
  else await db.blogPost.create({ data });
  revalidatePath("/blog"); revalidatePath("/admin/blog");
}

export async function deleteBlogPostAction(formData: FormData) {
  await requireAdmin();
  await db.blogPost.delete({ where: { id: idSchema.parse(formData.get("id")) } });
  revalidatePath("/blog"); revalidatePath("/admin/blog");
}

export async function toggleBlogPublishedAction(formData: FormData) {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const post = await db.blogPost.findUniqueOrThrow({ where: { id }, select: { published: true } });
  await db.blogPost.update({ where: { id }, data: { published: !post.published, publishedAt: !post.published ? new Date() : null } });
  revalidatePath("/blog"); revalidatePath("/admin/blog");
}

export async function saveProfessionalAction(formData: FormData) {
  await requireAdmin();
  const arrayValue = (key: string): string[] => String(formData.get(key) ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
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
  const serviceId = String(formData.get("serviceId") || "");
  const beforeAfterSchema = z.object({ title: z.string().min(2), serviceId: z.string().optional(), beforeImage: z.string().url(), afterImage: z.string().url(), patientConsent: z.literal(true), published: z.boolean(), description: z.string().optional(), problem: z.string().optional(), goal: z.string().optional(), techniques: z.string().optional(), sessions: z.string().optional(), evolution: z.string().optional(), routeSlug: z.string().optional() });
  const parsed = beforeAfterSchema.parse({ title: formData.get("title"), serviceId: serviceId || undefined, beforeImage: formData.get("beforeImage"), afterImage: formData.get("afterImage"), patientConsent: formData.get("patientConsent") === "true", published: formData.get("published") === "true", description: String(formData.get("description") ?? "") || undefined, problem: String(formData.get("problem") ?? "") || undefined, goal: String(formData.get("goal") ?? "") || undefined, techniques: String(formData.get("techniques") ?? "") || undefined, sessions: String(formData.get("sessions") ?? "") || undefined, evolution: String(formData.get("evolution") ?? "") || undefined, routeSlug: String(formData.get("routeSlug") ?? "") || undefined });
  const data = { ...parsed, serviceId: parsed.serviceId || null, description: parsed.description || null };
  const id = String(formData.get("id") || "");
  if (id) await db.beforeAfter.update({ where: { id }, data });
  else await db.beforeAfter.create({ data });
  revalidatePath("/admin/antes-y-despues");
}

export async function deleteBeforeAfterAction(formData: FormData) {
  await requireAdmin();
  await db.beforeAfter.delete({ where: { id: idSchema.parse(formData.get("id")) } });
  revalidatePath("/admin/antes-y-despues");
}

export async function toggleBeforeAfterPublishedAction(formData: FormData) {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const record = await db.beforeAfter.findUniqueOrThrow({ where: { id }, select: { published: true } });
  await db.beforeAfter.update({ where: { id }, data: { published: !record.published } });
  revalidatePath("/admin/antes-y-despues");
}

export async function updateLeadNotesAction(formData: FormData) {
  await requireAdmin();
  await db.lead.update({ where: { id: idSchema.parse(formData.get("id")) }, data: { notes: String(formData.get("notes") ?? "").trim() || null } });
  revalidatePath("/admin/leads");
}

export { checkoutTotal };
