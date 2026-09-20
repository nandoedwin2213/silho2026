import { NextResponse } from "next/server";
import { runRecurringBilling } from "@/lib/subscriptions";

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected || request.headers.get("authorization") !== `Bearer ${expected}`) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  return NextResponse.json(await runRecurringBilling());
}
