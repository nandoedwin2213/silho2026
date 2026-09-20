import { formatInClinicTz } from "@/lib/time";
import { requirePatient } from "@/lib/patient-auth";
import { db } from "@/lib/db";

export default async function PointsPage() {
  const session = await requirePatient();
  const transactions = await db.pointsTransaction.findMany({ where: { patientId: session.patientId }, orderBy: { createdAt: "desc" } });
  return <main className="mx-auto max-w-5xl px-6 py-12 lg:py-20"><p className="text-xs uppercase tracking-[0.22em] text-gold">Face Rewards</p><h1 className="mt-3 font-heading text-4xl text-navy">Historial de puntos</h1><div className="mt-8 overflow-x-auto rounded-2xl border bg-white"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-4">Fecha</th><th className="p-4">Motivo</th><th className="p-4">Puntos</th><th className="p-4">Vence</th></tr></thead><tbody>{transactions.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="p-4 text-muted-foreground">{formatInClinicTz(item.createdAt, { dateStyle: "medium" })}</td><td className="p-4"><p className="font-medium text-navy">{item.reason}</p><p className="text-xs text-muted-foreground">{item.description}</p></td><td className={`p-4 font-semibold ${item.points < 0 ? "text-red-700" : "text-green-700"}`}>{item.points > 0 ? "+" : ""}{item.points}</td><td className="p-4 text-muted-foreground">{item.expiresAt ? formatInClinicTz(item.expiresAt, { dateStyle: "medium" }) : "—"}</td></tr>)}</tbody></table></div></main>;
}
