"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerLoginSchema = exports.customerPasswordSchema = exports.customerProfileSchema = void 0;
const zod_1 = require("zod");
// Step 1: Profile Information
exports.customerProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, "First name is required"),
    lastName: zod_1.z.string().min(2).optional(),
    address: zod_1.z.string(),
    city: zod_1.z.string(),
    state: zod_1.z.string(),
    zipCode: zod_1.z.string().optional(),
    phone: zod_1.z.string(),
    email: zod_1.z.string().email("Invalid email address"),
});
// Step 2: Password setup
exports.customerPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email required to set password"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
// Step 3: Login setup
exports.customerLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email required to set password"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
