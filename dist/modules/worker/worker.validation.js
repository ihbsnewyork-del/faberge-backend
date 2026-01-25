"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWorkerProfileSchema = exports.workerProfileSchema = void 0;
const zod_1 = require("zod");
// Step 1: Profile Information
exports.workerProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, "First name is required"),
    lastName: zod_1.z.string().min(2).optional(),
    address: zod_1.z.string(),
    city: zod_1.z.string(),
    state: zod_1.z.string(),
    phone: zod_1.z.string(),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    workerId: zod_1.z.string().min(1, "Worker ID is required"),
    title: zod_1.z.string().optional(),
    zipCode: zod_1.z.string().min(1, "Zip code is required"),
    isBlocked: zod_1.z.boolean().optional(),
    services: zod_1.z.array(zod_1.z.object({
        service: zod_1.z.string().min(1, "Service ID is required"),
        subcategories: zod_1.z.array(zod_1.z.string()).optional(),
    })),
});
// Step 1: Update Profile Information
exports.updateWorkerProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, "First name is required"),
    lastName: zod_1.z.string().min(2).optional(),
    address: zod_1.z.string(),
    city: zod_1.z.string(),
    state: zod_1.z.string(),
    phone: zod_1.z.string(),
    email: zod_1.z.string().email("Invalid email address"),
    workerId: zod_1.z.string().min(1, "Worker ID is required"),
    title: zod_1.z.string().optional(),
    zipCode: zod_1.z.string().min(1, "Zip code is required"),
    isBlocked: zod_1.z.boolean().optional(),
    services: zod_1.z.array(zod_1.z.object({
        service: zod_1.z.string().min(1, "Service ID is required"),
        subcategories: zod_1.z.array(zod_1.z.string()).optional(),
    })),
});
