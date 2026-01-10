import { Schema, model, Document, Types } from "mongoose";

const slotSchema = new Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    isBooked: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    heldBy: { type: Schema.Types.ObjectId, ref: "Booking", default: null },
    heldUntil: { type: Date, default: null },
  },
  { _id: true }
);

export interface ISlot extends Document {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  isBlocked: boolean;
  heldBy: Types.ObjectId | null;
  heldUntil: Date | null;
}

export interface ITimeSlot extends Document {
  worker: Types.ObjectId;
  date: Date;
  isOffDay: boolean;
  slots: Types.DocumentArray<ISlot>;
  heldBy: Types.ObjectId | null;
}

const timeSlotSchema = new Schema<ITimeSlot>(
  {
    worker: { type: Schema.Types.ObjectId, ref: "Worker", required: true },
    date: { type: Date, required: true },
    isOffDay: { type: Boolean, default: false },
    slots: [slotSchema],
    heldBy: { type: Schema.Types.ObjectId, ref: "Customer", default: null },
  },
  { timestamps: true }
);

export const TimeSlotModel = model<ITimeSlot>("TimeSlot", timeSlotSchema);
