import { z } from "zod";

// Step 1: Profile Information
export const customerProfileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2).optional(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string().optional(),
  phone: z.string(),
  email: z.string().email("Invalid email address"),
});

// Step 2: Password setup
export const customerPasswordSchema = z.object({
  email: z.string().email("Email required to set password"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Step 3: Login setup
export const customerLoginSchema = z.object({
  email: z.string().email("Email required to set password"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type CustomerProfileInput = z.infer<typeof customerProfileSchema>;
export type CustomerPasswordInput = z.infer<typeof customerPasswordSchema>;
export type CustomerLoginInput = z.infer<typeof customerLoginSchema>;
