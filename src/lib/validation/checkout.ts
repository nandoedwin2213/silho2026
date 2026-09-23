import { z } from "zod";

export const checkoutSchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  apellido: z.string().trim().min(2).max(80).optional(),
  documentId: z.string().trim().min(5).max(30).optional(),
  email: z.string().email().optional(),
  telefono: z.string().trim().min(7).max(30),
  ciudad: z.string().trim().min(2).max(80).optional(),
  serviceId: z.string().min(1),
  paymentMethod: z.enum(["PAYPHONE", "TRANSFER", "CASH"]),
  pointsRedeemed: z.coerce.number().int().min(0).default(0),
  referralCode: z.string().trim().max(40).optional(),
  acceptTerms: z.literal(true),
  locationId: z.string().min(1).optional(),
  preferredDate: z.string().optional(),
  preferredSlot: z.enum(["Mañana 09-12", "Tarde 14-18"]).optional(),
  patientGoal: z.string().trim().max(500).optional(),
  acceptDataConsent: z.literal(true).optional(),
});
