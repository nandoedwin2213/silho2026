"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePatient } from "@/lib/patient-auth";
import { db } from "@/lib/db";
import { startSubscription } from "@/lib/subscriptions";

const schema = z.object({
  planId: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  consent: z.literal("on"),
  legal: z.literal("on"),
  consentText: z.string().min(20),
  termsVersion: z.string().min(1),
});

export async function subscribeAction(formData: FormData) {
  const parsed = schema.parse({
    planId: formData.get("planId"),
    slug: formData.get("slug"),
    consent: formData.get("consent"),
    legal: formData.get("legal"),
    consentText: formData.get("consentText"),
    termsVersion: formData.get("termsVersion"),
  });
  const session = await requirePatient();
  const plan = await db.subscriptionPlan.findUnique({ where: { id: parsed.planId, slug: parsed.slug, active: true } });
  if (!plan) throw new Error("El programa no está disponible.");
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
  const result = await startSubscription({ patientId: session.patientId, planId: plan.id, consent: { ip, text: parsed.consentText, termsVersion: parsed.termsVersion } });
  if (result.redirectUrl) redirect(result.redirectUrl);
  redirect(`/membresias/${parsed.slug}?configuracion=pendiente`);
}
