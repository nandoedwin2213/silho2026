import { NextResponse } from "next/server";
import { requestClaimCode } from "@/lib/patient-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { documentId?: string; email?: string; phone?: string };
    if (!body.documentId || !body.email) return NextResponse.json({ error: "Ingrese su documento y correo electrónico." }, { status: 400 });
    await requestClaimCode({ documentId: body.documentId, email: body.email, phone: body.phone });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No pudimos enviar el código." }, { status: 400 });
  }
}
