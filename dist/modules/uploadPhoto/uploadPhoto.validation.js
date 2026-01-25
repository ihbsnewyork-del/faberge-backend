"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPhotoSchema = void 0;
const zod_1 = require("zod");
exports.uploadPhotoSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, "Name is required"),
});
