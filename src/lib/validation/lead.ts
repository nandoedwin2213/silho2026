import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(30),
  email: z.string().email().optional().or(z.literal("")),
  interestedService: z.string().trim().max(120).optional(),
  source: z.enum(["WEB", "WHATSAPP", "INSTAGRAM", "FACEBOOK", "TIKTOK", "GOOGLE", "REFERRAL"]).default("WEB"),
  notes: z.string().trim().max(2000).optional(),
});
