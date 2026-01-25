"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyPolicyModel = void 0;
const mongoose_1 = require("mongoose");
const privacyPolicySchema = new mongoose_1.Schema({
    privacyPolicy: {
        type: String,
        default: null,
    },
}, { timestamps: true });
exports.PrivacyPolicyModel = (0, mongoose_1.model)("PrivacyPolicy", privacyPolicySchema);
