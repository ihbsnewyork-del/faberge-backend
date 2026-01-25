"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutUsModel = void 0;
const mongoose_1 = require("mongoose");
const aboutUsSchema = new mongoose_1.Schema({
    aboutUs: {
        type: String,
        default: "About us",
    },
}, { timestamps: true });
exports.AboutUsModel = (0, mongoose_1.model)("AboutUs", aboutUsSchema);
