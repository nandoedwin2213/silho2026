import { z } from "zod";

export const appointmentSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  documentId: z.string().trim().min(5).max(30),
  email: z.string().email(),
  phone: z.string().trim().min(7).max(30),
  city: z.string().trim().min(2).max(80),
  serviceId: z.string().min(1),
  locationId: z.string().min(1),
  professionalId: z.string().min(1),
  date: z.coerce.date(),
  time: z.string().regex(/^(09|1[0-8]):(00|30)$/),
  notes: z.string().trim().max(2000).optional(),
  acceptPrivacy: z.boolean().refine((value) => value, "Debes aceptar la política de privacidad."),
});
