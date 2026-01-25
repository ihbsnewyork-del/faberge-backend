"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateModel = void 0;
const mongoose_1 = require("mongoose");
const stateSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    active: { type: Boolean, default: false },
}, { timestamps: true });
exports.StateModel = (0, mongoose_1.model)("State", stateSchema);
