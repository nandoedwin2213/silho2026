export type CardHolderData = { name?: string; email?: string; phoneNumber?: string; documentId?: string };

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function cardHolderFromConfirmation(raw: unknown): CardHolderData {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    name: text(record.optionalParameter4),
    email: text(record.email),
    phoneNumber: text(record.phoneNumber),
    documentId: text(record.document) ?? text(record.documentId),
  };
}

export function toPayphonePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("593")) return digits;
  if (digits.startsWith("0")) return `593${digits.slice(1)}`;
  return digits.length === 9 ? `593${digits}` : digits;
}

export function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] ?? "", lastName: parts[0] ?? "" };
  if (parts.length === 2) return { firstName: parts[0], lastName: parts[1] };
  const half = Math.ceil(parts.length / 2);
  return { firstName: parts.slice(0, half).join(" "), lastName: parts.slice(half).join(" ") };
}
