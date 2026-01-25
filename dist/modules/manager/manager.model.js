"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerModel = void 0;
const mongoose_1 = require("mongoose");
const managerSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: false },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    uploadPhoto: { type: String, default: null },
    isBlocked: { type: Boolean, default: false },
    managerId: { type: String, default: null },
    resetOtp: { type: Number, default: null },
    otpExpires: { type: Date, default: null },
    otpVerified: { type: Boolean, default: false },
    role: { type: String, default: "manager" },
    accessibility: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Accessibility",
        default: null,
    },
    // isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.ManagerModel = (0, mongoose_1.model)("Manager", managerSchema);
