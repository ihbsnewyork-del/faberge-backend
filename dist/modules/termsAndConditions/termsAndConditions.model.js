"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermsAndConditionsModel = void 0;
const mongoose_1 = require("mongoose");
const termsAndConditionsSchema = new mongoose_1.Schema({
    termsAndConditions: {
        type: String,
        default: null,
    },
}, { timestamps: true });
exports.TermsAndConditionsModel = (0, mongoose_1.model)("TermsAndConditions", termsAndConditionsSchema);
