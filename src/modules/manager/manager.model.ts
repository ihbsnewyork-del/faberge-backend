import { Schema, model, Document, Types } from "mongoose";
import { IAccessibility } from "../accessibility/accessibility.model";

export interface IManager extends Document {
  firstName: string;
  lastName?: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  isBlocked: boolean;
  password: string;
  managerId: string | null;
  uploadPhoto: string | null;
  resetOtp?: number | null;
  otpExpires?: Date | null;
  otpVerified?: boolean;
  role: string;
  accessibility?: Types.ObjectId | IAccessibility;
  // isDeleted: boolean;
}

const managerSchema = new Schema<IManager>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: false },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    uploadPhoto: { type: String, default: null },
    isBlocked: { type: Boolean, default: false },
    managerId: { type: String, default: null },
    resetOtp: { type: Number, default: null },
    otpExpires: { type: Date, default: null },
    otpVerified: { type: Boolean, default: false },
    role: { type: String, default: "manager" },
    accessibility: {
      type: Schema.Types.ObjectId,
      ref: "Accessibility",
      default: null,
    },
    // isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ManagerModel = model<IManager>("Manager", managerSchema);
