"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccessibilityValidation = void 0;
const zod_1 = require("zod");
exports.updateAccessibilityValidation = zod_1.z.object({
    isDashboardShow: zod_1.z.boolean().optional(),
    isAnalyticsShow: zod_1.z.boolean().optional(),
    isUsersShow: zod_1.z.boolean().optional(),
    isServicesShow: zod_1.z.boolean().optional(),
    isTransactionsShow: zod_1.z.boolean().optional(),
    isHelpAndSupportShow: zod_1.z.boolean().optional(),
    isBookingManagementShow: zod_1.z.boolean().optional(),
    isStateShow: zod_1.z.boolean().optional(),
    isSiteContentShow: zod_1.z.boolean().optional(),
    isNotificationShow: zod_1.z.boolean().optional(),
});
