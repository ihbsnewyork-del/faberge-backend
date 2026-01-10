import { Document, Schema, Types, model } from "mongoose";

interface IContactUs extends Document {
  firstName: string;
  lastName?: string | null;
  email: string;
  message: string;
  isRead: boolean;
  subject: string;
}

const contactUsSchema = new Schema<IContactUs>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: false },
    email: { type: String, required: true },
    message: { type: String, required: true },
    subject: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ContactUsModel = model<IContactUs>("ContactUs", contactUsSchema);
