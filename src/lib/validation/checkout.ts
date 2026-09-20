import { z } from "zod";

export const checkoutSchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  apellido: z.string().trim().min(2).max(80),
  documentId: z.string().trim().min(5).max(30),
  email: z.string().email(),
  telefono: z.string().trim().min(7).max(30),
  ciudad: z.string().trim().min(2).max(80),
  serviceId: z.string().min(1),
  paymentMethod: z.enum(["PAYPHONE", "TRANSFER", "CASH"]),
  pointsRedeemed: z.coerce.number().int().min(0).default(0),
  referralCode: z.string().trim().max(40).optional(),
  acceptTerms: z.literal(true),
});
