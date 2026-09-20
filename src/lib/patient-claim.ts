export type ExistingPatientContact = {
  email?: string | null;
  phone?: string | null;
};

export type PatientClaimInput = {
  email: string;
  phone: string;
};

function normalizeDigits(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

export function canClaimPatient(existing: ExistingPatientContact, input: PatientClaimInput) {
  const existingEmail = existing.email?.trim().toLowerCase() ?? "";
  if (existingEmail) return existingEmail === input.email.trim().toLowerCase();
  return normalizeDigits(existing.phone) !== "" && normalizeDigits(existing.phone) === normalizeDigits(input.phone);
}
