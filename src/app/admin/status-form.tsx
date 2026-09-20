"use client";

import { useTransition } from "react";
import { updateStatusAction, markOrderPaidAction } from "./actions";

export function StatusForm({ model, id, value, options }: { model: string; id: string; value: string; options: string[] }) {
  const [pending, startTransition] = useTransition();
  return <form action={updateStatusAction}><input type="hidden" name="model" value={model} /><input type="hidden" name="id" value={id} /><select key={value} name="status" defaultValue={value} disabled={pending} onChange={(event) => startTransition(() => event.currentTarget.form?.requestSubmit())} className="h-8 rounded-lg border bg-white px-2 text-xs">{options.map((option) => <option key={option}>{option}</option>)}</select></form>;
}

export function MarkPaid({ id }: { id: string }) {
  return <form action={markOrderPaidAction}><input type="hidden" name="id" value={id} /><button className="text-xs font-semibold text-gold">Marcar pagado</button></form>;
}
