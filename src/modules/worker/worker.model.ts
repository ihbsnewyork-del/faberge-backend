import { Schema, model, Document, Types } from "mongoose";
import { IService } from "../services/services.model";

export interface IWorker extends Document {
  firstName: string;
  lastName?: string;
  address: string;
  title?: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  isBlocked: boolean;
  password: string;
  workerId: string;
  uploadPhoto: string | null;
  resetOtp?: number | null;
  otpExpires?: Date | null;
  otpVerified?: boolean;
  role: string;
  zipCode: string;
  services: {
    service: Types.ObjectId | IService;
    subcategories?: Types.ObjectId[];
  }[];
  isDeleted: boolean;
}

const workerSchema = new Schema<IWorker>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: false },
    address: { type: String, required: true },
    title: { type: String, required: false },
    city: { type: String, required: true },
    state: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    uploadPhoto: { type: String, default: null },
    isBlocked: { type: Boolean, default: false },
    zipCode: { type: String, required: true },
    workerId: { type: String },
    resetOtp: { type: Number, default: null },
    otpExpires: { type: Date, default: null },
    otpVerified: { type: Boolean, default: false },
    role: { type: String, default: "worker" },
    isDeleted: { type: Boolean, default: false },
    services: [
      {
        service: {
          type: Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },
        subcategories: [
          {
            type: Schema.Types.ObjectId,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export const WorkerModel = model<IWorker>("Worker", workerSchema);
