"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServiceValidation = exports.createServiceValidation = exports.subcategorySchema = void 0;
const zod_1 = require("zod");
exports.subcategorySchema = zod_1.z.object({
    subcategoryName: zod_1.z.string().min(1, "Subcategory name is required"),
    subcategoryPrice: zod_1.z.number().min(0, "Subcategory price must be positive"),
});
exports.createServiceValidation = zod_1.z.object({
    serviceName: zod_1.z.string().min(1, "Service name is required"),
    price: zod_1.z.number().min(1, "Price is required"),
    subcategory: zod_1.z.array(exports.subcategorySchema).optional(),
});
exports.updateServiceValidation = zod_1.z.object({
    serviceName: zod_1.z.string().optional(),
    price: zod_1.z.number().optional(),
    subcategory: zod_1.z.array(exports.subcategorySchema).optional(),
});
