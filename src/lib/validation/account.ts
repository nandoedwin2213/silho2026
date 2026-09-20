import { z } from "zod";

export const accountRegistrationSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  documentId: z.string().trim().min(5).max(30),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(30),
  city: z.string().trim().max(80).optional(),
  password: z.string().min(8).max(100),
  referralCode: z.string().trim().max(40).optional(),
  claimCode: z.string().trim().length(6).optional(),
});

export const accountLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});
