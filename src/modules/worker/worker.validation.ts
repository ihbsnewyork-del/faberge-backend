import { z } from "zod";

// Step 1: Profile Information
export const workerProfileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2).optional(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  phone: z.string(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  workerId: z.string().min(1, "Worker ID is required"),
  title: z.string().optional(),
  zipCode: z.string().min(1, "Zip code is required"),
  isBlocked: z.boolean().optional(),
  services: z.array(
    z.object({
      service: z.string().min(1, "Service ID is required"),
      subcategories: z.array(z.string()).optional(),
    })
  ),
});
// Step 1: Update Profile Information
export const updateWorkerProfileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2).optional(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  phone: z.string(),
  email: z.string().email("Invalid email address"),
  workerId: z.string().min(1, "Worker ID is required"),
  title: z.string().optional(),
  zipCode: z.string().min(1, "Zip code is required"),
  isBlocked: z.boolean().optional(),
  services: z.array(
    z.object({
      service: z.string().min(1, "Service ID is required"),
      subcategories: z.array(z.string()).optional(),
    })
  ),
});

export type WorkerProfileInput = z.infer<typeof workerProfileSchema>;

export type UpdateWorkerProfileInput = z.infer<
  typeof updateWorkerProfileSchema
>;
