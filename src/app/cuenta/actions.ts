"use server";

import { redirect } from "next/navigation";
import { loginPatient, logoutPatient, registerPatient } from "@/lib/patient-auth";

export async function registerAccountAction(_previous: { error?: string }, formData: FormData) {
  try {
    await registerPatient({
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      documentId: String(formData.get("documentId") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      city: String(formData.get("city") ?? "") || undefined,
      password: String(formData.get("password") ?? ""),
      referralCode: String(formData.get("referralCode") ?? "") || undefined,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo crear la cuenta." };
  }
  redirect("/cuenta");
}

export async function loginAccountAction(_previous: { error?: string }, formData: FormData) {
  try {
    await loginPatient(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo iniciar sesión." };
  }
  redirect("/cuenta");
}

export async function logoutAccountAction() {
  await logoutPatient();
}
