import { Document, Schema, Types, model } from "mongoose";

interface IPrivacyPolicy extends Document {
  privacyPolicy: string;
}

const privacyPolicySchema = new Schema<IPrivacyPolicy>(
  {
    privacyPolicy: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const PrivacyPolicyModel = model<IPrivacyPolicy>(
  "PrivacyPolicy",
  privacyPolicySchema
);
