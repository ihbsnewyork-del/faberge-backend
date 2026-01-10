import { model, Schema, Types } from "mongoose";

export interface IBookingService {
  service: Types.ObjectId;
  subcategories?: Types.ObjectId[];
}

export interface IBooking extends Document {
  customer: Types.ObjectId;
  worker: Types.ObjectId;
  services: IBookingService[];
  date: Date;
  startTime: string;
  endTime: string;
  status: "booked" | "completed" | "cancelled" | "expired" | "pending";
  isPayment: { type: Boolean; default: false };
  transactionId: { type: String; default: null };
  paymentAmount: Number;
  paymentExpiresAt: Date | null;
  isTransactionDeleted: boolean;
  isNotificationDeleted: boolean;
}

const bookingSchema = new Schema<IBooking>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    worker: { type: Schema.Types.ObjectId, ref: "Worker", required: true },
    services: [
      {
        service: {
          type: Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },
        subcategories: [{ type: Schema.Types.ObjectId }],
      },
    ],
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["booked", "completed", "cancelled", "expired", "pending"],
      default: "pending",
    },
    paymentAmount: { type: Number, default: 0 },
    isPayment: { type: Boolean, default: false },
    transactionId: { type: String, default: null },
    paymentExpiresAt: { type: Date, default: null },
    isTransactionDeleted: { type: Boolean, default: false },
    isNotificationDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookingSchema.index({ paymentExpiresAt: 1, status: 1 });

export const BookingModel = model<IBooking>("Booking", bookingSchema);
