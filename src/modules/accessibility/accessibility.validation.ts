import { z } from "zod";

export const updateAccessibilityValidation = z.object({
  isDashboardShow: z.boolean().optional(),
  isAnalyticsShow: z.boolean().optional(),
  isUsersShow: z.boolean().optional(),
  isServicesShow: z.boolean().optional(),
  isTransactionsShow: z.boolean().optional(),
  isHelpAndSupportShow: z.boolean().optional(),
  isBookingManagementShow: z.boolean().optional(),
  isStateShow: z.boolean().optional(),
  isSiteContentShow: z.boolean().optional(),
  isNotificationShow: z.boolean().optional(),
});
