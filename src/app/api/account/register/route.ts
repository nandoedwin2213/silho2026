import { NextResponse } from "next/server";
import { registerPatient } from "@/lib/patient-auth";

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const result = await registerPatient(input);
    return NextResponse.json({ patientId: result.patient.id, referralCode: result.account.referralCode }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo crear la cuenta." }, { status: 400 });
  }
}
