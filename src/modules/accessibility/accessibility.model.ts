import { Schema, model, Document } from "mongoose";

export interface IAccessibility extends Document {
  isDashboardShow: boolean;
  isAnalyticsShow: boolean;
  isUsersShow: boolean;
  isServicesShow: boolean;
  isTransactionsShow: boolean;
  isHelpAndSupportShow: boolean;
  isBookingManagementShow: boolean;
  isStateShow: boolean;
  isSiteContentShow: boolean;
  isNotificationShow: boolean;
  isProfileShow: boolean;
}

const accessibilitySchema = new Schema<IAccessibility>(
  {
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
  },
  { timestamps: true }
);

export const AccessibilityModel = model<IAccessibility>(
  "Accessibility",
  accessibilitySchema
);
