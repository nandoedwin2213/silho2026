export function normalizePhone(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("593")) return `0${digits.slice(3)}`;
  return digits;
}

export function placeholderDocumentId(phone: string) {
  return `TEL-${phone}`;
}

export function isPlaceholderDocument(id: string) {
  return id.startsWith("TEL-");
}
