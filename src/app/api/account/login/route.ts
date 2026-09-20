import { NextResponse } from "next/server";
import { loginPatient } from "@/lib/patient-auth";

export async function POST(request: Request) {
  try {
    const input = await request.json() as { email?: string; password?: string };
    const account = await loginPatient(input.email ?? "", input.password ?? "");
    return NextResponse.json({ patientId: account.patientId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo iniciar sesión." }, { status: 400 });
  }
}
