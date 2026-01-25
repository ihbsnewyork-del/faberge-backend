"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceTimeModel = exports.ServiceModel = void 0;
const mongoose_1 = require("mongoose");
const subcategorySchema = new mongoose_1.Schema({
    subcategoryName: { type: String, required: true },
    subcategoryPrice: { type: Number, required: true },
});
const serviceSchema = new mongoose_1.Schema({
    serviceName: { type: String, required: true },
    price: { type: Number, required: true },
    subcategory: { type: [subcategorySchema], required: false },
}, { timestamps: true });
const serviceTimeSchema = new mongoose_1.Schema({
    startTime: {
        type: String,
        required: true,
        default: "09:00",
    },
    endTime: {
        type: String,
        required: true,
        default: "19:00",
    },
}, { timestamps: true });
exports.ServiceModel = (0, mongoose_1.model)("Service", serviceSchema);
exports.ServiceTimeModel = (0, mongoose_1.model)("ServiceTime", serviceTimeSchema);
