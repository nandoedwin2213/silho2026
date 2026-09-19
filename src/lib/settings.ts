import { cache } from "react";
import { db } from "./db";

export const getSetting = cache(async (key: string, fallback?: string) => {
  const setting = await db.setting.findUnique({ where: { key } });
  return setting?.value ?? fallback ?? null;
});

export async function getSettings(keys: string[]) {
  const records = await db.setting.findMany({ where: { key: { in: keys } } });
  return Object.fromEntries(keys.map((key) => [key, records.find((record) => record.key === key)?.value ?? null]));
}

export function setSetting(key: string, value: string) {
  return db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
}
