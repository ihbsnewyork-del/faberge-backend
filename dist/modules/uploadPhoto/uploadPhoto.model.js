"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadPhotoModel = void 0;
const mongoose_1 = require("mongoose");
const uploadPhotoSchema = new mongoose_1.Schema({
    title: { type: String, required: true, unique: true },
    image: { type: String, default: null },
    video: { type: String, default: null },
}, { timestamps: true });
exports.UploadPhotoModel = (0, mongoose_1.model)("UploadPhoto", uploadPhotoSchema);
