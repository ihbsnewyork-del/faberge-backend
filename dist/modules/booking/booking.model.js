"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingModel = void 0;
const mongoose_1 = require("mongoose");
const bookingSchema = new mongoose_1.Schema({
    customer: { type: mongoose_1.Schema.Types.ObjectId, ref: "Customer", required: true },
    worker: { type: mongoose_1.Schema.Types.ObjectId, ref: "Worker", required: true },
    services: [
        {
            service: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Service",
                required: true,
            },
            subcategories: [{ type: mongoose_1.Schema.Types.ObjectId }],
        },
    ],
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
        type: String,
        enum: ["booked", "completed", "cancelled", "expired", "pending"],
        default: "pending",
    },
    paymentAmount: { type: Number, default: 0 },
    isPayment: { type: Boolean, default: false },
    transactionId: { type: String, default: null },
    paymentExpiresAt: { type: Date, default: null },
    isTransactionDeleted: { type: Boolean, default: false },
    isNotificationDeleted: { type: Boolean, default: false },
}, { timestamps: true });
bookingSchema.index({ paymentExpiresAt: 1, status: 1 });
exports.BookingModel = (0, mongoose_1.model)("Booking", bookingSchema);
