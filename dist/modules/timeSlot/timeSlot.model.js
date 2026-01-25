"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeSlotModel = void 0;
const mongoose_1 = require("mongoose");
const slotSchema = new mongoose_1.Schema({
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    isBooked: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    heldBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "Booking", default: null },
    heldUntil: { type: Date, default: null },
}, { _id: true });
const timeSlotSchema = new mongoose_1.Schema({
    worker: { type: mongoose_1.Schema.Types.ObjectId, ref: "Worker", required: true },
    date: { type: Date, required: true },
    isOffDay: { type: Boolean, default: false },
    slots: [slotSchema],
    heldBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "Customer", default: null },
}, { timestamps: true });
exports.TimeSlotModel = (0, mongoose_1.model)("TimeSlot", timeSlotSchema);
