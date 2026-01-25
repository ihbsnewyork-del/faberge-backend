"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessibilityModel = void 0;
const mongoose_1 = require("mongoose");
const accessibilitySchema = new mongoose_1.Schema({
    isDashboardShow: { type: Boolean, default: false },
    isAnalyticsShow: { type: Boolean, default: false },
    isUsersShow: { type: Boolean, default: false },
    isServicesShow: { type: Boolean, default: false },
    isTransactionsShow: { type: Boolean, default: false },
    isHelpAndSupportShow: { type: Boolean, default: false },
    isBookingManagementShow: { type: Boolean, default: false },
    isStateShow: { type: Boolean, default: false },
    isSiteContentShow: { type: Boolean, default: false },
    isNotificationShow: { type: Boolean, default: false },
    isProfileShow: { type: Boolean, default: true },
}, { timestamps: true });
exports.AccessibilityModel = (0, mongoose_1.model)("Accessibility", accessibilitySchema);
