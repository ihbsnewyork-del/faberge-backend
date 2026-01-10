import { Schema, model, Document, Types } from "mongoose";

export interface ICustomer extends Document {
  firstName: string;
  lastName?: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  phone: string;
  email: string;
  isBlocked: boolean;
  password?: string | null;
  uploadPhoto?: string | null;
  resetOtp?: number | null;
  otpExpires?: Date | null;
  otpVerified?: boolean;
  role: string;
  isDeleted: boolean;
}

const customerSchema = new Schema<ICustomer>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: false },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: false },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    uploadPhoto: { type: String, default: null },
    isBlocked: { type: Boolean, default: false },
    resetOtp: { type: Number, default: null },
    otpExpires: { type: Date, default: null },
    otpVerified: { type: Boolean, default: false },
    role: { type: String, default: "customer" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CustomerModel = model<ICustomer>("Customer", customerSchema);
