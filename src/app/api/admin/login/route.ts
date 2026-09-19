import { NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.formData();
  const ok = await login(String(body.get("email") ?? ""), String(body.get("password") ?? ""));
  if (!ok) return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
