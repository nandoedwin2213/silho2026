import { z } from "zod";

export const appointmentSchema = z.object({
  patientId: z.string().min(1),
  serviceId: z.string().min(1),
  locationId: z.string().min(1),
  professionalId: z.string().min(1),
  date: z.coerce.date(),
  notes: z.string().trim().max(2000).optional(),
});
