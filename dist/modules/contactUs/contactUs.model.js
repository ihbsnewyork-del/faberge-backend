"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactUsModel = void 0;
const mongoose_1 = require("mongoose");
const contactUsSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: false },
    email: { type: String, required: true },
    message: { type: String, required: true },
    subject: { type: String, required: true },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });
exports.ContactUsModel = (0, mongoose_1.model)("ContactUs", contactUsSchema);
