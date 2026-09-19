export const CLINIC_TZ = "America/Guayaquil";

function offsetMinutes(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" }).formatToParts(date);
  const value = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = value.match(/^GMT([+-])(\d{2})(?::?(\d{2}))?$/);
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0);
  return (match[1] === "-" ? -1 : 1) * minutes;
}

export function zonedDateToUtc(dateISO: string, time: string, tz = CLINIC_TZ) {
  const [year, month, day] = dateISO.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const localWallTime = Date.UTC(year, month - 1, day, hours, minutes);
  let utcMillis = localWallTime - offsetMinutes(new Date(localWallTime), tz) * 60_000;
  utcMillis = localWallTime - offsetMinutes(new Date(utcMillis), tz) * 60_000;
  return new Date(utcMillis);
}

export function formatInClinicTz(date: Date | string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("es-EC", { ...opts, timeZone: CLINIC_TZ }).format(new Date(date));
}

export function clinicDateISO(date: Date | string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: CLINIC_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(date));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
