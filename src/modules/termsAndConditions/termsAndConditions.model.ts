import { Document, Schema, model } from "mongoose";

interface ITermsAndConditions extends Document {
  termsAndConditions: string;
}

const termsAndConditionsSchema = new Schema<ITermsAndConditions>(
  {
    termsAndConditions: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const TermsAndConditionsModel = model<ITermsAndConditions>(
  "TermsAndConditions",
  termsAndConditionsSchema
);
