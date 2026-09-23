import { normalizePhone } from "./phone";

export type ExistingPatientContact = {
  email?: string | null;
  phone?: string | null;
};

export type PatientClaimInput = {
  email: string;
  phone: string;
};

export function canClaimPatient(existing: ExistingPatientContact, input: PatientClaimInput) {
  const existingEmail = existing.email?.trim().toLowerCase() ?? "";
  if (existingEmail) return existingEmail === input.email.trim().toLowerCase();
  return normalizePhone(existing.phone) !== "" && normalizePhone(existing.phone) === normalizePhone(input.phone);
}
