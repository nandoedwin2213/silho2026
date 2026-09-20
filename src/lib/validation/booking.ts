import { z } from "zod";

export const bookingSchema = z.object({
  objective: z.enum(["rejuvenecimiento-facial", "acne", "cicatrices-acne"]).optional(),
  locationId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^(09|1[0-8]):(00|30)$/),
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  documentId: z.string().trim().min(5).max(30),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(30),
  city: z.string().trim().min(2).max(80),
  intake: z.object({
    allergies: z.boolean().default(false),
    pregnancy: z.boolean().default(false),
    recentTreatments: z.boolean().default(false),
    medication: z.boolean().default(false),
    notes: z.string().trim().max(500).optional(),
  }).default({ allergies: false, pregnancy: false, recentTreatments: false, medication: false }),
  referralCode: z.string().trim().max(40).optional(),
  pointsRedeemed: z.coerce.number().int().min(0).default(0),
  paymentMethod: z.enum(["PAYPHONE", "TRANSFER", "CASH"]),
  acceptPrivacy: z.literal(true),
  acceptTerms: z.literal(true),
});
