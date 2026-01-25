"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.managerLoginSchema = exports.managerProfileSchema = void 0;
const zod_1 = require("zod");
// Step 1: Profile Information
exports.managerProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, "First name is required"),
    lastName: zod_1.z.string().min(2).optional(),
    address: zod_1.z.string(),
    city: zod_1.z.string(),
    state: zod_1.z.string(),
    phone: zod_1.z.string(),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    managerId: zod_1.z.string().min(1, "Manager ID is required"),
});
// Step 2: Login setup
exports.managerLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email required"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
