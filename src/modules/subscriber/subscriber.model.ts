import { Document, Schema, model } from "mongoose";

export interface ISubscriber extends Document {
  email: string;
  isRead: boolean;
}

const subscriberSchema = new Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SubscriberModel = model<ISubscriber>(
  "Subscriber",
  subscriberSchema
);
