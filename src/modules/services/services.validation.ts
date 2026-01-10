import { z } from "zod";

export const subcategorySchema = z.object({
  subcategoryName: z.string().min(1, "Subcategory name is required"),
  subcategoryPrice: z.number().min(0, "Subcategory price must be positive"),
});

export const createServiceValidation = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  price: z.number().min(1, "Price is required"),
  subcategory: z.array(subcategorySchema).optional(),
});

export const updateServiceValidation = z.object({
  serviceName: z.string().optional(),
  price: z.number().optional(),
  subcategory: z.array(subcategorySchema).optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceValidation>;
export type UpdateServiceInput = z.infer<typeof updateServiceValidation>;
