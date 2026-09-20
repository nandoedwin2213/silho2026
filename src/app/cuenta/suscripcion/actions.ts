"use server";

import { revalidatePath } from "next/cache";
import { requirePatient } from "@/lib/patient-auth";
import { cancelSubscription } from "@/lib/subscriptions";

export async function cancelSubscriptionAction(formData: FormData) {
  const session = await requirePatient();
  const id = String(formData.get("id") || "");
  await cancelSubscription(id, session.patientId);
  revalidatePath("/cuenta/suscripcion");
}
