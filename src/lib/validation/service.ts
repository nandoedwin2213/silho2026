import { z } from "zod";

export const serviceAdminSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  categoryId: z.string().min(1),
  description: z.string().trim().min(10),
  shortDescription: z.string().trim().min(5),
  basePrice: z.coerce.number().nonnegative(),
  webPrice: z.coerce.number().nonnegative().optional(),
  priceFrom: z.boolean().default(true),
  showPrice: z.boolean().default(true),
  discountEligible: z.boolean().default(true),
  requiresMedicalAssessment: z.boolean().default(false),
  requiresManualQuote: z.boolean().default(false),
  isSurgical: z.boolean().default(false),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  durationMinutes: z.coerce.number().int().positive().optional(),
  image: z.string().url().optional().or(z.literal("")),
  concerns: z.array(z.string()).default([]),
}).superRefine((value, context) => {
  if (value.webPrice != null && value.webPrice > value.basePrice) context.addIssue({ code: "custom", path: ["webPrice"], message: "El precio web no puede superar el precio regular." });
});
