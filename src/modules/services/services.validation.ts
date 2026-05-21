import { z } from "zod";

export const subcategorySchema = z.object({
  subcategoryName: z.string().min(1, "Subcategory name is required"),
  subcategoryPrice: z.number().min(0, "Subcategory price must be positive"),
});

const serviceDurationSchema = z
  .number()
  .min(30, "Duration must be at least 30 minutes")
  .max(480, "Duration cannot exceed 8 hours (480 minutes)")
  .refine((v) => v % 30 === 0, {
    message: "Duration must be in 30-minute increments",
  });

export const createServiceValidation = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  price: z.number().min(1, "Price is required"),
  agencyFee: z.number().min(0, "Agency fee must be 0 or greater").default(0),
  serviceDuration: serviceDurationSchema.default(60),
  subcategory: z.array(subcategorySchema).optional(),
});

export const updateServiceValidation = z.object({
  serviceName: z.string().optional(),
  price: z.number().optional(),
  agencyFee: z.number().min(0).optional(),
  serviceDuration: serviceDurationSchema.optional(),
  subcategory: z.array(subcategorySchema).optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceValidation>;
export type UpdateServiceInput = z.infer<typeof updateServiceValidation>;
