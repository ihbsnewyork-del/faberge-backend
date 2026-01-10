import { z } from "zod";

// Step 1: Profile Information
export const managerProfileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2).optional(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  phone: z.string(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  managerId: z.string().min(1, "Manager ID is required"),
});

// Step 2: Login setup
export const managerLoginSchema = z.object({
  email: z.string().email("Email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type ManagerProfileInput = z.infer<typeof managerProfileSchema>;
export type ManagerLoginInput = z.infer<typeof managerLoginSchema>;
