import { z } from "zod";

export const providerFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone is required"),
  business_name: z.string().optional(),
  services: z.array(z.string()).min(1, "Select at least one service"),
  location: z.string().min(2, "Location is required"),
  experience: z.string().optional(),
  description: z.string().optional(),
});

export type ProviderFormSchema = typeof providerFormSchema;
