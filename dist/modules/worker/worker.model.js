"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerModel = void 0;
const mongoose_1 = require("mongoose");
const workerSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: false },
    address: { type: String, required: true },
    title: { type: String, required: false },
    city: { type: String, required: true },
    state: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    uploadPhoto: { type: String, default: null },
    isBlocked: { type: Boolean, default: false },
    zipCode: { type: String, required: true },
    workerId: { type: String },
    resetOtp: { type: Number, default: null },
    otpExpires: { type: Date, default: null },
    otpVerified: { type: Boolean, default: false },
    role: { type: String, default: "worker" },
    isDeleted: { type: Boolean, default: false },
    services: [
        {
            service: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Service",
                required: true,
            },
            subcategories: [
                {
                    type: mongoose_1.Schema.Types.ObjectId,
                },
            ],
        },
    ],
}, { timestamps: true });
exports.WorkerModel = (0, mongoose_1.model)("Worker", workerSchema);
