"use server";

import { login } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(_: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!(await login(email, password))) return { error: "Correo o contraseña incorrectos." };
  redirect("/admin");
}
